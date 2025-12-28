const jwt = require("jsonwebtoken");

const USERS = {
  student: { id: "25SUUBEADS185", pass: "student123" },
  admin: { id: "admin", pass: "admin123" }
};

exports.login = (req, res) => {
  const { identifier, password } = req.body;

  let role = null;

  if (identifier === USERS.student.id && password === USERS.student.pass) {
    role = "student";
  }

  if (identifier === USERS.admin.id && password === USERS.admin.pass) {
    role = "admin";
  }

  if (!role) return res.status(401).send("Invalid credentials");

  const token = jwt.sign(
    { role, id: identifier },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });

  res.redirect(`/${role}`);
};
