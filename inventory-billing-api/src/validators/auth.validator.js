
'use strict';

const sendValidationError = (res, message) =>
  res.status(422).json({
    success: false,
    message,
  });

const getRequestBody = (req) => {
  if (
    !req.body ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {
    return null;
  }

  return req.body;
};

const validateLogin = (req, res, next) => {
  const body = getRequestBody(req);

  if (!body) {
    return sendValidationError(
      res,
      'Request body must be a JSON object',
    );
  }

  const { username, password } = body;

  if (typeof username !== 'string' || !username.trim()) {
    return sendValidationError(res, 'Username is required');
  }

  if (typeof password !== 'string' || !password) {
    return sendValidationError(res, 'Password is required');
  }

  if (username.trim().length > 100) {
    return sendValidationError(res, 'Username is too long');
  }

  return next();
};

const validateForgotPassword = (req, res, next) => {
  const body = getRequestBody(req);

  if (!body) {
    return sendValidationError(
      res,
      'Request body must be a JSON object',
    );
  }

  const { email } = body;

  if (typeof email !== 'string' || !email.trim()) {
    return sendValidationError(res, 'Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > 254) {
    return sendValidationError(
      res,
      'Email address is too long',
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return sendValidationError(
      res,
      'Please provide a valid email address',
    );
  }

  req.body.email = normalizedEmail;

  return next();
};

const validateResetPassword = (req, res, next) => {
  const body = getRequestBody(req);

  if (!body) {
    return sendValidationError(
      res,
      'Request body must be a JSON object',
    );
  }

  const { token, newPassword } = body;

  if (
    typeof token !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return sendValidationError(
      res,
      'A valid reset token is required',
    );
  }

  if (typeof newPassword !== 'string' || !newPassword) {
    return sendValidationError(
      res,
      'New password is required',
    );
  }

  if (newPassword.length < 8) {
    return sendValidationError(
      res,
      'Password must be at least 8 characters long',
    );
  }

  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return sendValidationError(
      res,
      'Password must not exceed 72 UTF-8 bytes',
    );
  }

  return next();
};

module.exports = {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
