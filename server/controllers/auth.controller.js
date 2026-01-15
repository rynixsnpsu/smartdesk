const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  trackLoginAttempt,
  isAccountLocked,
  blacklistToken,
  validatePasswordStrength,
  checkPasswordHistory,
  logSecurityEvent,
  SECURITY_CONFIG,
  generateDeviceFingerprint,
} = require("../middleware/auth.middleware");

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      await logSecurityEvent(req, "LOGIN_MISSING_CREDENTIALS");
      return res.status(400).json({ error: "Identifier and password required" });
    }

    // Check account lockout
    const lockStatus = isAccountLocked(identifier);
    if (lockStatus.locked) {
      await logSecurityEvent(req, "LOGIN_ATTEMPT_LOCKED_ACCOUNT", { identifier });
      return res.status(423).json({
        error: "Account is locked due to multiple failed login attempts",
        lockedUntil: lockStatus.lockedUntil,
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select("+password");

    if (!user) {
      trackLoginAttempt(identifier, false);
      await logSecurityEvent(req, "LOGIN_INVALID_USER", { identifier });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      await logSecurityEvent(req, "LOGIN_INACTIVE_ACCOUNT", { userId: user.id });
      return res.status(401).json({ error: "Account is inactive" });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      const attemptResult = trackLoginAttempt(identifier, false);
      await logSecurityEvent(req, "LOGIN_FAILED", { 
        userId: user.id, 
        remainingAttempts: attemptResult.remainingAttempts 
      });
      
      if (!attemptResult.allowed) {
        await logSecurityEvent(req, "ACCOUNT_LOCKED", { userId: user.id });
        return res.status(423).json({
          error: "Too many failed login attempts. Account locked.",
          lockedUntil: attemptResult.lockedUntil,
        });
      }
      
      return res.status(401).json({ 
        error: "Invalid credentials",
        remainingAttempts: attemptResult.remainingAttempts,
      });
    }

    // Successful login
    trackLoginAttempt(identifier, true);
    
    // Update user login info
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
    user.lastLogin = new Date();
    user.lastLoginIP = ip;
    user.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });

    await logSecurityEvent(req, "LOGIN_SUCCESS", { userId: user.id, ip });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        username: user.username,
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: SECURITY_CONFIG.TOKEN_EXPIRY,
        algorithm: "HS256",
      }
    );

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: SECURITY_CONFIG.TOKEN_EXPIRY * 1000,
      path: "/",
    });

    // Return JSON response
    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    await logSecurityEvent(req, "LOGIN_ERROR", { error: err.message });
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Get current user
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await logSecurityEvent(req, "USER_DATA_ACCESS", { userId: user.id });
    
    res.json({ user });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    
    if (token) {
      blacklistToken(token);
      await logSecurityEvent(req, "LOGOUT_SUCCESS", { userId: req.user?.id });
    }
    
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      await logSecurityEvent(req, "PASSWORD_CHANGE_FAILED", { reason: "INVALID_CURRENT_PASSWORD" });
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      await logSecurityEvent(req, "PASSWORD_CHANGE_FAILED", { reason: "WEAK_PASSWORD" });
      return res.status(400).json({
        error: "Password does not meet security requirements",
        requirements: strength.checks,
      });
    }

    const canUse = await checkPasswordHistory(user.id, newPassword);
    if (!canUse) {
      await logSecurityEvent(req, "PASSWORD_CHANGE_FAILED", { reason: "PASSWORD_REUSED" });
      return res.status(400).json({ error: "Cannot reuse recent passwords" });
    }

    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }
    user.passwordHistory.push(user.password);
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.shift();
    }
    
    user.password = newPassword;
    await user.save();

    await logSecurityEvent(req, "PASSWORD_CHANGED", { userId: user.id });
    
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: SECURITY_CONFIG.TOKEN_EXPIRY }
    );

    await logSecurityEvent(req, "TOKEN_REFRESHED", { userId: user.id });

    res.json({ token });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};
