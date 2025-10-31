const express = require("express");
const {
  getElections,
  getElectionDetails,
  getReceiptsForElection,
  getParties,
  getElectionResults,
  getElectionStatus,
  verifyReceipt,
} = require("../controllers/public.controller");

const router = express.Router();

router.get("/elections", getElections);
router.get("/elections/:id", getElectionDetails);
router.get("/elections/:id/receipts", getReceiptsForElection);
router.get("/elections/:id/results", getElectionResults);
router.get("/elections/:id/status", getElectionStatus);
router.get("/parties", getParties);
router.get("/verify-receipt/:receiptCode", verifyReceipt);

module.exports = router;
