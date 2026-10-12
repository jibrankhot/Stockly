
'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabase = require('../config/database');
const env = require('../config/env');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('./email.service');

const PASSWORD_RESET_LIFETIME_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72;

const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const login = async (username, password) => {
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    username.trim().length > 100 ||
    typeof password !== 'string' ||
    !password ||
    Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES
  ) {
    throw createServiceError('Invalid username or password', 401);
  }

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
    .eq('username', username.trim())
    .maybeSingle();

  if (error) {
    console.error('Login user lookup failed:', {
      code: error.code,
      message: error.message,
    });

    throw createServiceError('Unable to sign in right now');
  }

  // Keep the public response consistent for unknown, inactive,
  // and incorrect-credential cases.
  if (!user || !user.is_active || !user.password_hash) {
    throw createServiceError('Invalid username or password', 401);
  }

  let passwordMatches;

  try {
    passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );
  } catch (error) {
    console.error('Password verification failed:', {
      message: error.message,
    });

    throw createServiceError('Unable to sign in right now');
  }

  if (!passwordMatches) {
    throw createServiceError('Invalid username or password', 401);
  }

  let token;

  try {
    token = generateToken({
      id: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: user.roles?.name,
    });
  } catch (error) {
    console.error('Access-token generation failed:', {
      message: error.message,
    });

    throw createServiceError('Unable to sign in right now');
  }

  // Login should still succeed if nonessential last-login tracking fails.
  const { error: lastLoginError } = await supabase
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (lastLoginError) {
    console.error('Failed to update last login:', {
      code: lastLoginError.code,
      message: lastLoginError.message,
    });
  }

  const { password_hash, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

const getCurrentUser = async (userId) => {
  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw createServiceError('Invalid authentication token', 401);
  }

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
    console.error('Current-user lookup failed:', {
      code: error.code,
      message: error.message,
    });

    throw createServiceError('Unable to retrieve user information');
  }

  if (!user || !user.is_active) {
    throw createServiceError('User not found or inactive', 401);
  }

  return user;
};

const requestPasswordReset = async (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, is_active')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Password-reset user lookup failed:', {
      code: error.code,
      message: error.message,
    });

    throw createServiceError('Unable to process password reset');
  }

  // Do not disclose whether an account exists or is active.
  if (!user || !user.is_active || !user.email) {
    return;
  }

  const { error: deleteError } = await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('user_id', user.id)
    .is('used_at', null);

  if (deleteError) {
    console.error('Failed to clear old reset tokens:', {
      code: deleteError.code,
      message: deleteError.message,
    });

    throw createServiceError('Unable to process password reset');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(resetToken);

  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_LIFETIME_MS,
  ).toISOString();

  const { error: insertError } = await supabase
    .from('password_reset_tokens')
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

  if (insertError) {
    console.error('Failed to create reset token:', {
      code: insertError.code,
      message: insertError.message,
    });

    throw createServiceError('Unable to process password reset');
  }

  const resetUrl =
    `${env.frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

  const safeName = escapeHtml(user.full_name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Stockly password',
      text: [
        `Hello ${user.full_name || 'there'},`,
        '',
        'We received a request to reset your Stockly password.',
        '',
        'Use this link to create a new password:',
        resetUrl,
        '',
        'This link expires in one hour.',
        'If you did not request this, you can ignore this email.',
        '',
        'Regards,',
        'Stockly',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17191c">
          <h2>Reset your Stockly password</h2>
          <p>Hello ${safeName},</p>
          <p>We received a request to reset your Stockly password.</p>
          <p>
            <a href="${safeResetUrl}"
               style="display:inline-block;padding:12px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">
              Reset Password
            </a>
          </p>
          <p>This link expires in <strong>one hour</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p>Regards,<br>Stockly</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Password-reset email delivery failed:', {
      message: error?.message,
    });

    throw createServiceError('Unable to send password reset email');
  }
};

const resetPassword = async (token, newPassword) => {
  if (
    typeof token !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(token) ||
    typeof newPassword !== 'string' ||
    newPassword.length < 8 ||
    Buffer.byteLength(newPassword, 'utf8') > MAX_PASSWORD_BYTES
  ) {
    throw createServiceError(
      'Invalid or expired password reset link',
      400,
    );
  }

  let passwordHash;

  try {
    passwordHash = await bcrypt.hash(
      newPassword,
      BCRYPT_ROUNDS,
    );
  } catch (error) {
    console.error('Password hashing failed:', {
      message: error.message,
    });

    throw createServiceError('Unable to reset password');
  }

  const tokenHash = hashResetToken(token);

  const { data, error } = await supabase.rpc(
    'reset_user_password',
    {
      p_token_hash: tokenHash,
      p_password_hash: passwordHash,
    },
  );

  if (error) {
    console.error('Atomic password reset failed:', {
      code: error.code,
      message: error.message,
    });

    throw createServiceError('Unable to reset password');
  }

  if (data !== true) {
    throw createServiceError(
      'Invalid or expired password reset link',
      400,
    );
  }
};

module.exports = {
  login,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
};
