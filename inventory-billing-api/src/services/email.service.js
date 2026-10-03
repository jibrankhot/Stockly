const nodemailer = require('nodemailer');

const env = require('../config/env');

const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: {
        user: env.mail.user,
        pass: env.mail.password
    }
});

const sendEmail = async ({ to, subject, html, text }) => {
    if (!to) {
        throw new Error('Recipient email is required');
    }

    if (!subject) {
        throw new Error('Email subject is required');
    }

    if (!html && !text) {
        throw new Error('Email content is required');
    }

    return transporter.sendMail({
        from: env.mail.from,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendEmail
};