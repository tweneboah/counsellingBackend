const express = require("express");
const counselingController = require("../controllers/counseling.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all counseling routes
router.use(authMiddleware.protect);

// Check consent for all counseling routes
router.use(authMiddleware.checkConsent);

// Chat routes
router.post("/chat", counselingController.chatWithAI);
router.get("/chats", counselingController.getChatSessions);
router.get("/chats/:id", counselingController.getChatById);
router.patch("/chats/:id/end", counselingController.endChatSession);

// Journal routes
router.post("/journal", counselingController.createJournalEntry);
router.get("/journals", counselingController.getJournalEntries);
router.get("/journals/:id", counselingController.getJournalById);
router.patch("/journals/:id", counselingController.updateJournalEntry);
router.delete("/journals/:id", counselingController.deleteJournalEntry);

module.exports = router;
