const express = require("express");
const authRoutes = require("./auth.routes");
const voteRoutes = require("./vote.routes");
const adminRoutes = require("./admin.routes");
const publicRoutes = require("./public.routes");
const partyRoutes = require("./party.routes");
const blockchainRoutes = require("./blockchain.routes");
const manifestoRoutes = require("./manifesto.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/vote", voteRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);
router.use("/party", partyRoutes);
router.use("/blockchain", blockchainRoutes);
router.use("/manifesto", manifestoRoutes);

module.exports = router;
