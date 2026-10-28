const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../../../../middleware/authmiddleware");
const authorizeRoles = require("../../../../middleware/authorizeRoles");


// Enforce authentication & CUSTOMER role on all routes
router.use(authMiddleware, authorizeRoles("CUSTOMER"));


// 1. Get customer's 5 recent ticket names
router.get("/my-recent-tickets", aiController.getMyRecentTicketNames);
// 2. Query ticket status by ticket name (subject)
router.get("/ticket-status-by-name", aiController.getTicketStatusByName);

// 3. FAQ troubleshooting & chat
router.post("/faq-chat", aiController.chatFaq);

// 4. Classify raw customer issue into structured draft
router.post("/classify-issue", aiController.classifyIssue);

// 5. Confirm and create ticket in database (with original input preserved)
router.post("/confirm-ticket", aiController.confirmTicket);


module.exports = router;