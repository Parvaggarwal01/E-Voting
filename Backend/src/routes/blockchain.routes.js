const express = require("express");
const {
  getBlockchainStats,
  getBlockchainVoters,
  getBlockchainVotes,
} = require("../controllers/blockchain.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get blockchain statistics
router.get("/stats", getBlockchainStats);

// Get blockchain voters with pagination
router.get("/voters", getBlockchainVoters);

// Get blockchain votes with pagination
router.get("/votes", getBlockchainVotes);

module.exports = router;
