const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabase = require('../config/database');
const env = require('../config/env');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('./email.service');

const login = async (username, password) => {
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            password_hash,
            role_id,
            is_active,
            roles (
                id,
                name,
                description
            )
        `)
        .eq('username', username)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!user) {
        throw new Error('Invalid username or password');
    }

    if (!user.is_active) {
        throw new Error('User account is inactive');
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error('Invalid username or password');
    }

    const tokenPayload = {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        roleName: user.roles?.name
    };

    const token = generateToken(tokenPayload);

    await supabase
        .from('users')
        .update({
            last_login_at: new Date().toISOString()
        })
        .eq('id', user.id);

    delete user.password_hash;

    return {
        token,
        user
    };
};

const getCurrentUser = async (userId) => {
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            role_id,
            is_active,
            last_login_at,
            created_at,
            updated_at,
            roles (
                id,
                name,
                description
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

const requestPasswordReset = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            id,
            email,
            full_name,
            is_active
        `)
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!user || !user.is_active) {
        return;
    }

    const { error: deleteError } = await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('user_id', user.id)
        .is('used_at', null);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const expiresAt = new Date(
        Date.now() + 60 * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt
        });

    if (insertError) {
        throw new Error(insertError.message);
    }

    const resetUrl =
        `${env.frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail({
        to: user.email,
        subject: 'Reset your Stockly password',
        text: `
Hello ${user.full_name},

We received a request to reset your Stockly password.

Use the following link to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

Regards,
Stockly
        `.trim(),
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17191c;">
                <h2>Reset your Stockly password</h2>

                <p>Hello ${user.full_name},</p>

                <p>
                    We received a request to reset your Stockly password.
                </p>

                <p>
                    Click the button below to create a new password:
                </p>

                <p>
                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background: #2563eb;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in <strong>1 hour</strong>.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

                <p>
                    Regards,<br>
                    Stockly
                </p>
            </div>
        `
    });
};

const resetPassword = async (token, newPassword) => {
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const { data: resetToken, error } = await supabase
        .from('password_reset_tokens')
        .select(`
            id,
            user_id,
            expires_at,
            used_at
        `)
        .eq('token_hash', tokenHash)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!resetToken) {
        throw new Error('Invalid or expired password reset link');
    }

    if (resetToken.used_at) {
        throw new Error('This password reset link has already been used');
    }

    if (new Date(resetToken.expires_at) <= new Date()) {
        throw new Error('This password reset link has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const { error: updateError } = await supabase
        .from('users')
        .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
        })
        .eq('id', resetToken.user_id);

    if (updateError) {
        throw new Error(updateError.message);
    }

    const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .update({
            used_at: new Date().toISOString()
        })
        .eq('id', resetToken.id);

    if (tokenError) {
        throw new Error(tokenError.message);
    }
};

module.exports = {
    login,
    getCurrentUser,
    requestPasswordReset,
    resetPassword
};