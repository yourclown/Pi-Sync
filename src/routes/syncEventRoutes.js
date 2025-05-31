// src/routes/syncEventRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

const {
  createSyncEvent,
  getSyncHistory,
  getDevicesWithRepeatedFailures,
} = require('../controllers/syncEventController');

const validateRequest = require('../middleware/validateRequest');

/**
 * POST /sync-event
 * Body Params:
 *  - deviceId: string, required
 *  - timestamp: ISO8601 string or Date, required
 *  - totalFilesSync: integer >=0, required
 *  - totalErrors: integer >=0, required
 *  - internetSpeed: number >=0, required
 */
router.post(
  '/sync-event',
  [
    body('deviceId')
      .exists()
      .withMessage('deviceId is required.')
      .isString()
      .withMessage('deviceId must be a string.')
      .trim(),
    body('timestamp')
      .exists()
      .withMessage('timestamp is required.')
      .isISO8601()
      .withMessage('timestamp must be a valid ISO8601 date.'),
    body('totalFilesSync')
      .exists()
      .withMessage('totalFilesSync is required.')
      .isInt({ min: 0 })
      .withMessage('totalFilesSync must be an integer >= 0.'),
    body('totalErrors')
      .exists()
      .withMessage('totalErrors is required.')
      .isInt({ min: 0 })
      .withMessage('totalErrors must be an integer >= 0.'),
    body('internetSpeed')
      .exists()
      .withMessage('internetSpeed is required.')
      .isNumeric()
      .withMessage('internetSpeed must be a number.'),
    validateRequest,
  ],
  createSyncEvent
);

/**
 * GET /device/:id/sync-history
 * Path Param:
 *  - id: deviceId (string)
 * Query Params (optional):
 *  - page: integer >= 1 (default: 1)
 *  - limit: integer >= 1 (default: 50)
 */
router.get(
  '/device/:id/sync-history',
  [
    param('id')
      .exists()
      .withMessage('Device ID is required.')
      .isString()
      .withMessage('Device ID must be a string.')
      .trim(),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be an integer >= 1.'),
    query('limit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('limit must be an integer >= 1.'),
    validateRequest,
  ],
  getSyncHistory
);

/**
 * GET /devices/repeated-failures
 * No parameters. Returns devices with >3 failed syncs.
 */
router.get(
  '/devices/repeated-failures',
  getDevicesWithRepeatedFailures
);

module.exports = router;
