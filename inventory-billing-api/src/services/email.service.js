
'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: {
        user: env.mail.user,
        pass: env.mail.password,
    },
});

const sendEmail = async ({ to, subject, html, text } = {}) => {
    if (typeof to !== 'string' || !to.trim()) {
        throw new Error('Recipient email is required');
    }

    if (typeof subject !== 'string' || !subject.trim()) {
        throw new Error('Email subject is required');
    }

    const hasHtml = typeof html === 'string' && html.trim().length > 0;
    const hasText = typeof text === 'string' && text.trim().length > 0;

    if (!hasHtml && !hasText) {
        throw new Error('Email content is required');
    }

    try {
        return await transporter.sendMail({
            from: env.mail.from,
            to: to.trim(),
            subject: subject.trim(),
            ...(hasText ? { text } : {}),
            ...(hasHtml ? { html } : {}),
        });
    } catch (error) {
        console.error('Email delivery failed:', {
            code: error?.code,
            responseCode: error?.responseCode,
            command: error?.command,
        });

        throw new Error('Unable to send email right now');
    }
};

module.exports = {
    sendEmail,
};
