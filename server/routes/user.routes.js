const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

// All routes require admin role
router.use(protect("admin"));

router.get("/api/users", userController.getAllUsers);
router.get("/api/users/:id", userController.getUserById);
router.post("/api/users", userController.createUser);
router.put("/api/users/:id", userController.updateUser);
router.delete("/api/users/:id", userController.deleteUser);

module.exports = router;
