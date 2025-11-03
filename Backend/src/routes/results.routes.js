const express = require("express");
const {
  calculateElectionResults,
  getLiveVoteCount,
  verifyElectionIntegrity,
} = require("../controllers/results.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @route GET /api/results/election/:electionId
 * @desc Calculate final election results from anonymous votes
 * @access Protected (EC Commissioner only)
 */
router.get(
  "/election/:electionId",
  authenticateToken,
  calculateElectionResults
);

/**
 * @route GET /api/results/live/:electionId
 * @desc Get live vote count for ongoing election
 * @access Protected (EC Commissioner only)
 */
router.get("/live/:electionId", authenticateToken, getLiveVoteCount);

/**
 * @route GET /api/results/verify/:electionId
 * @desc Verify election integrity using cryptographic hashes
 * @access Protected (EC Commissioner only)
 */
router.get("/verify/:electionId", authenticateToken, verifyElectionIntegrity);

module.exports = router;
