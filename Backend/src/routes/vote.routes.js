const express = require("express");
const {
  requestSignature,
  submitVote,
  getPublicKey,
  submitVoteToChain,
} = require("../controllers/vote.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
router.use(authMiddleware);
router.get("/public-key", getPublicKey); // Get public key for blinding
router.post("/request-signature", requestSignature);
router.post("/submit", submitVote);
router.post("/submit-to-chain", submitVoteToChain);
module.exports = router;