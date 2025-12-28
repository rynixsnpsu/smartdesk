const jwt = require("jsonwebtoken");

exports.protect = (role = null) => {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.redirect("/login");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (role && decoded.role !== role) {
        return res.status(403).send("Forbidden");
      }

      req.user = decoded; // ✅ REQUIRED
      next();
    } catch {
      res.redirect("/login");
    }
  };
};
