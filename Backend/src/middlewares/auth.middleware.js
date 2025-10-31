const { verifyToken } = require("../utils/jwt.helpers");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token is required." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Export both names for compatibility
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.authMiddleware = authenticateToken;
