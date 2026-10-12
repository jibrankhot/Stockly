
'use strict';

const { verifyToken } = require('../utils/jwt');

const unauthorized = (res, message = 'Invalid or expired authentication token') =>
  res.status(401).json({
    success: false,
    message,
  });

const authenticate = (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization) {
    return unauthorized(res, 'Authentication token is required');
  }

  // The Bearer scheme is case-insensitive.
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return unauthorized(res);
  }

  let decoded;

  try {
    decoded = verifyToken(match[1]);
  } catch {
    return unauthorized(res);
  }

  if (
    !decoded ||
    typeof decoded !== 'object' ||
    Array.isArray(decoded) ||
    !Number.isSafeInteger(decoded.id) ||
    decoded.id <= 0
  ) {
    return unauthorized(res);
  }

  req.user = decoded;

  return next();
};

module.exports = {
  authenticate,
};
