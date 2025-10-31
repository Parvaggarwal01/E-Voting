const express = require("express");
const {
  createParty,
  deleteParty,
  updateParty,
  createElection,
  deleteElection,
  calculateResults,
  publishResults,
  getElectionStats,
  getDashboardStats,
  bulkRegisterVoters,
  getAllVoters,
  deleteVoter,
  resetVoterPassword,
} = require("../controllers/admin.controller");
const router = express.Router();

router.get("/dashboard/stats", getDashboardStats);
router.post("/parties", createParty);
router.put("/parties/:id", updateParty);
router.delete("/parties/:id", deleteParty);
router.post("/elections", createElection);
router.delete("/elections/:id", deleteElection);
router.post("/elections/:electionId/calculate-results", calculateResults);
router.post("/elections/:electionId/publish-results", publishResults);
router.get("/elections/:electionId/stats", getElectionStats);

// Voter management routes
router.post("/voters/bulk-register", bulkRegisterVoters);
router.get("/voters", getAllVoters);
router.delete("/voters/:id", deleteVoter);
router.post("/voters/:id/reset-password", resetVoterPassword);

module.exports = router;
