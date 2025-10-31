require('dotenv').config();

const config = {
  port: process.env.PORT || 8000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
};

module.exports = config;
