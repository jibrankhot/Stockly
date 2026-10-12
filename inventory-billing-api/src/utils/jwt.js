
'use strict';

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const TOKEN_LIFETIME = '30m';
const JWT_ALGORITHM = 'HS256';

const validateSecret = () => {
  if (
    typeof jwtSecret !== 'string' ||
    jwtSecret.trim().length < 32
  ) {
    throw new Error(
      'JWT secret must be configured with at least 32 characters',
    );
  }
};

const generateToken = (payload) => {
  validateSecret();

  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    throw new TypeError('JWT payload must be an object');
  }

  if (!Number.isSafeInteger(payload.id) || payload.id <= 0) {
    throw new TypeError('JWT payload must contain a valid user ID');
  }

  return jwt.sign(payload, jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: TOKEN_LIFETIME,
  });
};

const verifyToken = (token) => {
  validateSecret();

  if (typeof token !== 'string' || !token.trim()) {
    throw new TypeError('A JWT token is required');
  }

  return jwt.verify(token, jwtSecret, {
    algorithms: [JWT_ALGORITHM],
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
