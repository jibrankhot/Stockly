
'use strict';

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const explicitStatus = Number(err?.statusCode);
  const parserStatus = Number(err?.status);

  const validStatus = (status) =>
    Number.isInteger(status) && status >= 400 && status <= 599;

  let statusCode = 500;

  if (validStatus(explicitStatus)) {
    statusCode = explicitStatus;
  } else if (validStatus(parserStatus)) {
    statusCode = parserStatus;
  }

  const isClientError = statusCode >= 400 && statusCode < 500;
  const isJsonParserError = err?.type === 'entity.parse.failed';
  const isPayloadTooLarge = err?.type === 'entity.too.large';

  let message;

  if (isJsonParserError) {
    message = 'Invalid JSON request body';
  } else if (isPayloadTooLarge) {
    message = 'Request body is too large';
  } else if (
    typeof err?.publicMessage === 'string' &&
    err.publicMessage.trim()
  ) {
    message = err.publicMessage;
  } else if (isClientError) {
    message = err?.message || 'Request failed';
  } else {
    message = 'Internal server error';
  }

  // Diagnostic details stay on the server, not in the response.
  console.error('Stockly API error:', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code: err?.code,
    message: err?.message,
    ...(isProduction ? {} : { stack: err?.stack }),
  });

  const response = {
    success: false,
    message:
      isProduction && !isClientError
        ? 'Internal server error'
        : message,
  };

  if (
    typeof err?.publicCode === 'string' &&
    /^[A-Z0-9_]+$/.test(err.publicCode)
  ) {
    response.code = err.publicCode;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
