
'use strict';

const dotenv = require('dotenv');

dotenv.config();

const REQUIRED_VARIABLES = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASSWORD',
  'MAIL_FROM',
  'FRONTEND_URL',
];

const getRequiredString = (name) => {
  const value = process.env[name];

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
};

const parsePort = (value, name, fallback) => {
  const rawValue = value === undefined ? String(fallback) : value.trim();

  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`${name} must be a valid port number`);
  }

  const port = Number(rawValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be between 1 and 65535`);
  }

  return port;
};

const parseHttpUrl = (value, name) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error(`${name} must not contain URL credentials`);
  }

  return parsedUrl;
};

const nodeEnv = process.env.NODE_ENV || 'development';

if (!['development', 'test', 'production'].includes(nodeEnv)) {
  throw new Error(
    'NODE_ENV must be development, test, or production',
  );
}

for (const name of REQUIRED_VARIABLES) {
  getRequiredString(name);
}

const supabaseUrl = parseHttpUrl(
  getRequiredString('SUPABASE_URL'),
  'SUPABASE_URL',
);

if (
  supabaseUrl.pathname !== '/' ||
  supabaseUrl.search ||
  supabaseUrl.hash
) {
  throw new Error(
    'SUPABASE_URL must contain only the Supabase project origin',
  );
}

const jwtSecret = getRequiredString('JWT_SECRET');

if (Buffer.byteLength(jwtSecret, 'utf8') < 32) {
  throw new Error(
    'JWT_SECRET must contain at least 32 bytes of secret material',
  );
}

const frontendUrl = parseHttpUrl(
  getRequiredString('FRONTEND_URL'),
  'FRONTEND_URL',
);

const corsOriginValue = process.env.CORS_ORIGIN?.trim();

if (!corsOriginValue && nodeEnv === 'production') {
  throw new Error(
    'Missing required environment variable: CORS_ORIGIN',
  );
}

const corsOrigin = parseHttpUrl(
  corsOriginValue || 'http://localhost:4200',
  'CORS_ORIGIN',
);

const mailPort = parsePort(
  getRequiredString('MAIL_PORT'),
  'MAIL_PORT',
);

const port = parsePort(
  process.env.PORT,
  'PORT',
  5000,
);

module.exports = Object.freeze({
  port,
  nodeEnv,

  supabaseUrl: supabaseUrl.origin,
  supabaseServiceRoleKey: getRequiredString(
    'SUPABASE_SERVICE_ROLE_KEY',
  ),

  jwtSecret,

  corsOrigin: corsOrigin.origin,

  mail: Object.freeze({
    host: getRequiredString('MAIL_HOST'),
    port: mailPort,
    user: getRequiredString('MAIL_USER'),
    password: getRequiredString('MAIL_PASSWORD'),
    from: getRequiredString('MAIL_FROM'),
  }),

  frontendUrl: frontendUrl.origin,
});
