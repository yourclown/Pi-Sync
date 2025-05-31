// src/middleware/validateRequest.js
const { validationResult } = require('express-validator');

/**
 * Middleware to check validationResult from express-validator.
 * If any errors, respond with 400 and details.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validateRequest;
