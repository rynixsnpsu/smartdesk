const jwt = require("jsonwebtoken");

exports.protect = (role = null) => {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
      if (req.path.startsWith("/api") || String(req.headers.accept || "").includes("application/json")) {
        return res.status(401).json({ error: "Unauthenticated" });
      }
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (role && decoded.role !== role) {
        if (req.path.startsWith("/api") || String(req.headers.accept || "").includes("application/json")) {
          return res.status(403).json({ error: "Forbidden" });
        }
        return res.status(403).send("Forbidden");
      }

      req.user = decoded; // ✅ REQUIRED
      next();
    } catch {
      if (req.path.startsWith("/api") || String(req.headers.accept || "").includes("application/json")) {
        return res.status(401).json({ error: "Unauthenticated" });
      }
      res.redirect("/login");
    }
  };
};
