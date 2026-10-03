const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Username is required'
        });
    }

    if (!password || typeof password !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Password is required'
        });
    }

    next();
};

const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Email is required'
        });
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        return res.status(422).json({
            success: false,
            message: 'Email is required'
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
        return res.status(422).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    req.body.email = normalizedEmail.toLowerCase();

    next();
};

const validateResetPassword = (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Reset token is required'
        });
    }

    if (!newPassword || typeof newPassword !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'New password is required'
        });
    }

    if (newPassword.length < 8) {
        return res.status(422).json({
            success: false,
            message: 'Password must be at least 8 characters long'
        });
    }

    next();
};

module.exports = {
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};