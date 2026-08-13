const express = require("express");
const router = express.Router();
const commentsController = require("./comments.controller");
const authMiddleware = require("../../middleware/authmiddleware");

// Create a new comment
router.post(
  "/",
  authMiddleware,
  commentsController.addComment
);

module.exports = router;
