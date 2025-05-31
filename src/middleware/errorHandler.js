// src/middleware/errorHandler.js

/**
 * Centralized error handler for Express.
 * If the error has a statusCode property, use it; otherwise default to 500.
 * Always respond JSON with { message, ...(optional details) }.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);

  const statusCode = err.statusCode || 500;
  const response = {
    message: err.message || 'Internal Server Error',
  };

  // In production, don’t expose stack traces
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
