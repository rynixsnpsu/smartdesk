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

const app = express();
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

/* Core middleware */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(securityMiddleware);
app.use(express.static(path.join(__dirname, "public")));

/* Views */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* Routes */
app.get("/", (req, res) => res.render("landing", { showNavbar: true }));
app.get("/login", (req, res) => res.render("login", { showNavbar: false }));

app.use(authRoutes);
app.use(studentRoutes);
app.use(adminRoutes);

/* Error handling */
app.use(errorHandler);

/* Boot */
connectDB();
app.listen(process.env.PORT, () =>
  console.log(`🚀 Smart Desk running on port ${process.env.PORT}`)
);
