const express = require("express");
const partyController = require("../controllers/party.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Middleware to ensure user is a party
const ensureParty = (req, res, next) => {
  if (req.user.role !== "PARTY") {
    return res
      .status(403)
      .json({ error: "Access denied. Party role required." });
  }
  next();
};

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(ensureParty);

// Party profile routes
router.get("/profile", partyController.getPartyProfile);
router.put("/profile", partyController.updatePartyProfile);
router.post("/change-password", partyController.changePartyPassword);

// Party dashboard
router.get("/dashboard", partyController.getPartyDashboard);

// Party elections
router.get("/elections", partyController.getPartyElections);

// Manifesto management
router.post("/manifesto/upload", partyController.uploadManifesto);

module.exports = router;
