const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authmiddleware");
const userController = require("./usercontroller");

// Protect all user routes
router.use(authMiddleware);

// Profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);

module.exports = router;
