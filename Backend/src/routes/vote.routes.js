const express = require("express");
const {
  requestSignature,
  submitVote,
} = require("../controllers/vote.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
router.use(authMiddleware); // Protect all vote routes
router.post("/request-signature", requestSignature);
router.post("/submit", submitVote);
module.exports = router;
