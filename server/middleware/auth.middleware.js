const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RateLimit = require("express-rate-limit");
const crypto = require("crypto");

// Try to require AuditLog, but don't fail if it doesn't exist
let AuditLog;
try {
  AuditLog = require("../models/AuditLog");
} catch (err) {
  console.warn("AuditLog model not found, audit logging disabled");
}

// Security configurations
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  TOKEN_EXPIRY: 24 * 60 * 60, // 24 hours
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  DEVICE_FINGERPRINTING: false, // Disable for now to avoid issues
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
};

// Store for tracking login attempts
const loginAttempts = new Map();
const tokenBlacklist = new Set();

/**
 * Security Event Logging (non-blocking)
 */
async function logSecurityEvent(req, eventType, details = {}) {
  try {
    if (AuditLog) {
      await AuditLog.create({
        userId: req.user?.id || null,
        eventType,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
        details: JSON.stringify(details),
        timestamp: new Date(),
      });
    }
  } catch (err) {
    // Don't fail authentication if logging fails
    console.error("Failed to log security event:", err.message);
  }
}

/**
 * Device Fingerprinting
 */
function generateDeviceFingerprint(req) {
  const components = [
    req.headers["user-agent"],
    req.headers["accept-language"],
    req.ip,
  ].filter(Boolean).join("|");
  
  return crypto.createHash("sha256").update(components).digest("hex").substring(0, 32);
}

/**
 * IP Address Validation
 */
function validateIP(req) {
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
  const forwarded = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  
  return {
    ip: forwarded ? forwarded.split(",")[0].trim() : (realIP || ip),
    isBlocked: false, // Simplified for now
  };
}

/**
 * Login Attempt Tracking
 */
function trackLoginAttempt(identifier, success) {
  const key = `login:${identifier}`;
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
  
  if (success) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
  }
  
  attempts.count++;
  attempts.lastAttempt = Date.now();
  
  if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
    loginAttempts.set(key, attempts);
    return { allowed: false, lockedUntil: attempts.lockedUntil, reason: "MAX_ATTEMPTS_EXCEEDED" };
  }
  
  loginAttempts.set(key, attempts);
  return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts.count };
}

/**
 * Check if Account is Locked
 */
function isAccountLocked(identifier) {
  const key = `login:${identifier}`;
  const attempts = loginAttempts.get(key);
  if (!attempts) return { locked: false };
  
  if (attempts.lockedUntil > Date.now()) {
    return { locked: true, lockedUntil: attempts.lockedUntil };
  }
  
  if (attempts.lockedUntil > 0 && attempts.lockedUntil <= Date.now()) {
    loginAttempts.delete(key);
  }
  
  return { locked: false };
}

/**
 * Token Blacklist
 */
function blacklistToken(token) {
  tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), SECURITY_CONFIG.TOKEN_EXPIRY * 1000);
}

function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Validate Token
 */
function validateToken(token) {
  try {
    if (isTokenBlacklisted(token)) {
      throw new Error("Token has been revoked");
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw err;
  }
}

/**
 * Password Strength Validation
 */
function validatePasswordStrength(password) {
  const checks = {
    minLength: password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  return {
    valid: score >= 3,
    score,
    checks,
  };
}

/**
 * Check Password History
 */
async function checkPasswordHistory(userId, newPassword) {
  try {
    const user = await User.findById(userId).select("passwordHistory");
    if (!user || !user.passwordHistory || user.passwordHistory.length === 0) return true;
    
    const bcrypt = require("bcryptjs");
    for (const oldHash of user.passwordHistory.slice(-5)) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Password history check error:", err);
    return true; // Allow if check fails
  }
}

/**
 * Set Security Headers
 */
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

/**
 * Rate Limiter
 */
const rateLimiter = RateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
  max: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await logSecurityEvent(req, "RATE_LIMIT_EXCEEDED", { ip: req.ip });
    res.status(429).json({ error: "Too many requests, please try again later" });
  }
});

/**
 * Security Headers Middleware
 */
exports.securityHeaders = (req, res, next) => {
  setSecurityHeaders(res);
  next();
};

/**
 * Rate Limiting Middleware
 */
exports.rateLimit = rateLimiter;

/**
 * Main Authentication Middleware
 */
exports.protect = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      // Set security headers
      setSecurityHeaders(res);
      
      // Validate IP
      const ipInfo = validateIP(req);
      
      // Extract token
      const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        await logSecurityEvent(req, "MISSING_TOKEN");
        if (req.headers["content-type"]?.includes("application/json") || req.path.startsWith("/api")) {
          return res.status(401).json({ error: "Authentication required" });
        }
        return res.redirect("/login");
      }
      
      // Validate token
      let decoded;
      try {
        decoded = validateToken(token);
      } catch (err) {
        await logSecurityEvent(req, "INVALID_TOKEN", { error: err.message });
        if (req.headers["content-type"]?.includes("application/json") || req.path.startsWith("/api")) {
          return res.status(401).json({ error: err.message || "Invalid token" });
        }
        return res.redirect("/login");
      }
      
      // Get user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        await logSecurityEvent(req, "USER_NOT_FOUND", { userId: decoded.id });
        return res.status(401).json({ error: "User not found" });
      }
      
      if (!user.isActive) {
        await logSecurityEvent(req, "INACTIVE_USER_ACCESS", { userId: user.id });
        return res.status(401).json({ error: "Account is inactive" });
      }
      
      // Check account lockout
      const lockStatus = isAccountLocked(user.email);
      if (lockStatus.locked) {
        await logSecurityEvent(req, "LOCKED_ACCOUNT_ACCESS", { userId: user.id });
        return res.status(423).json({ 
          error: "Account is locked", 
          lockedUntil: lockStatus.lockedUntil 
        });
      }
      
      // Role check
      if (requiredRole && user.role !== requiredRole && user.role !== "admin" && user.role !== "super_admin") {
        await logSecurityEvent(req, "INSUFFICIENT_ROLE", { 
          userId: user.id, 
          userRole: user.role, 
          requiredRole 
        });
        return res.status(403).json({ error: "Insufficient privileges" });
      }
      
      // Attach user to request
      req.user = user;
      req.ip = ipInfo.ip;
      res.locals.user = user;
      
      // Log successful authentication
      await logSecurityEvent(req, "AUTHENTICATION_SUCCESS", { userId: user.id });
      
      next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      await logSecurityEvent(req, "AUTH_MIDDLEWARE_ERROR", { error: err.message });
      
      if (req.headers["content-type"]?.includes("application/json") || req.path.startsWith("/api")) {
        return res.status(500).json({ error: "Authentication failed" });
      }
      res.redirect("/login");
    }
  };
};

/**
 * Student Route Protection
 */
exports.protectStudent = exports.protect("student");

/**
 * Admin Route Protection
 */
exports.protectAdmin = exports.protect("admin");

/**
 * Optional Authentication
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = validateToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
          res.locals.user = user;
        }
      } catch (err) {
        // Ignore token errors for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
};

/**
 * Export utility functions
 */
exports.trackLoginAttempt = trackLoginAttempt;
exports.isAccountLocked = isAccountLocked;
exports.blacklistToken = blacklistToken;
exports.validatePasswordStrength = validatePasswordStrength;
exports.checkPasswordHistory = checkPasswordHistory;
exports.logSecurityEvent = logSecurityEvent;
exports.generateDeviceFingerprint = generateDeviceFingerprint;
exports.SECURITY_CONFIG = SECURITY_CONFIG;
