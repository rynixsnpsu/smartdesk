require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./data/db");
const securityMiddleware = require("./middleware/security.middleware");
const errorHandler = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const adminRoutes = require("./routes/admin.routes");
const newsletterRoutes = require("./routes/newsletter.routes");

function corsForClient(req, res, next) {
  const origin = req.headers.origin;
  const allowed = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  if (origin && origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

const app = express();

/* Core middleware */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(corsForClient);
app.use(securityMiddleware);
app.use(express.static(path.join(__dirname, "public")));

/* Routes (API + auth) */
app.use(authRoutes);
app.use(studentRoutes);
app.use(adminRoutes);
app.use(newsletterRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));


/* Error handling */
app.use(errorHandler);

/* Boot */
connectDB();
app.listen(process.env.PORT, () =>
  console.log(`🚀 Smart Desk running on port ${process.env.PORT}`)
);
