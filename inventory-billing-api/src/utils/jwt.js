
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config/env');

const generateToken = (payload) => {
    return jwt.sign(payload, jwtSecret, {
        expiresIn: '30m'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};

module.exports = {
    generateToken,
    verifyToken
};