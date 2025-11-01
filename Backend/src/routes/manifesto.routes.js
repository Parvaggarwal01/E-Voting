const express = require("express");
const {
  authenticateToken,
  requireRole,
} = require("../middlewares/auth.middleware");
const manifestoController = require("../controllers/manifesto.controller");

const router = express.Router();

// Party routes (upload and manage their manifestos)
router.post(
  "/upload",
  authenticateToken,
  requireRole("PARTY"),
  (req, res, next) => {
    manifestoController.upload.single("manifesto")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  manifestoController.uploadManifesto
);

router.get(
  "/my-manifestos",
  authenticateToken,
  requireRole("PARTY"),
  manifestoController.getPartyManifestos
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("PARTY"),
  manifestoController.deleteManifesto
);

router.post(
  "/analyze/:id",
  authenticateToken,
  requireRole("PARTY"),
  manifestoController.analyzeManifesto
);

// Voter/Public routes
router.get(
  "/parties-with-manifestos",
  authenticateToken,
  manifestoController.getPartiesWithManifestos
);

router.post("/chat", authenticateToken, manifestoController.chatWithManifesto);

router.get(
  "/download/:id",
  authenticateToken,
  manifestoController.downloadManifesto
);

module.exports = router;
