require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  BCRYPT_ROUNDS: 10,
};
