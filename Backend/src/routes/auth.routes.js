const express = require("express");
const {
  register,
  login,
  verify,
  changePassword,
} = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticateToken, verify);
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
