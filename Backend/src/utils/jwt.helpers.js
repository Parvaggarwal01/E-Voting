const jwt = require('jsonwebtoken');
const config = require('../config');

exports.generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};