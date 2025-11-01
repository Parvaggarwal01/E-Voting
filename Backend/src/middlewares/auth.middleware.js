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

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: `Access denied. ${role} role required.`,
      });
    }

    next();
  };
};

// Export both names for compatibility
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.authMiddleware = authenticateToken;
module.exports.requireRole = requireRole;
