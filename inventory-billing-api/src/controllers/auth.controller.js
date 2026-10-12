
'use strict';

const authService = require('../services/auth.service');
const {
  successResponse,
  errorResponse,
} = require('../utils/api-response');

const handleControllerError = (res, error, fallbackMessage) => {
  const statusCode =
    Number.isInteger(error?.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  if (statusCode >= 500) {
    console.error('Authentication controller error:', {
      message: error?.message,
      statusCode,
    });
  }

  const message =
    statusCode >= 500
      ? fallbackMessage
      : error.message || 'Request failed';

  return errorResponse(res, message, statusCode);
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    return successResponse(res, result, 'Login successful');
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to sign in right now',
    );
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    return successResponse(
      res,
      null,
      'If an account exists with this email address, password reset instructions have been sent.',
    );
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to process password reset',
    );
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    return successResponse(
      res,
      null,
      'Password has been reset successfully',
    );
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to reset password',
    );
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return successResponse(
      res,
      user,
      'User retrieved successfully',
    );
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to retrieve user information',
    );
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  me,
};
