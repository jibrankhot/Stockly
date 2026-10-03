const authService = require('../services/auth.service');
const {
    successResponse,
    errorResponse
} = require('../utils/api-response');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await authService.login(username, password);

        return successResponse(
            res,
            result,
            'Login successful'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            401
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
            'If an account exists with this email address, password reset instructions have been sent.'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            500
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
            'Password has been reset successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            400
        );
    }
};

const me = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        return successResponse(
            res,
            user,
            'User retrieved successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            404
        );
    }
};

module.exports = {
    login,
    forgotPassword,
    resetPassword,
    me
};