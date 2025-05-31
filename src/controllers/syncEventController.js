// src/controllers/syncEventController.js
const SyncEvent = require('../models/SyncEvent');
const { checkThreeConsecutiveFailures } = require('../utils/notifications');
const mongoose = require('mongoose');

/**
 * POST /sync-event
 *  - Validates body (done via express-validator in route).
 *  - Creates a new SyncEvent document.
 *  - Triggers check for 3 consecutive failures (bonus).
 */
const createSyncEvent = async (req, res, next) => {
  try {
    const { deviceId, timestamp, totalFilesSync, totalErrors, internetSpeed } =
      req.body;

    // Create and save the new sync event
    const newEvent = await SyncEvent.create({
      deviceId,
      timestamp,
      totalFilesSync,
      totalErrors,
      internetSpeed,
    });

    // Bonus: Check for 3 consecutive failures
    await checkThreeConsecutiveFailures(deviceId);

    return res.status(201).json({
      message: 'Sync event recorded successfully.',
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /device/:id/sync-history
 *  - :id is the deviceId
 *  - Query parameters: 
 *      - page (optional, default=1)
 *      - limit (optional, default=50)
 *  - Returns paginated history, sorted by timestamp DESC.
 */
const getSyncHistory = async (req, res, next) => {
  try {
    const deviceId = req.params.id;
    let { page = 1, limit = 50 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    // Count total documents for pagination metadata
    const totalCount = await SyncEvent.countDocuments({ deviceId });

    const events = await SyncEvent.find({ deviceId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      deviceId,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /devices/repeated-failures
 *  - Finds all devices that have more than 3 events where totalErrors > 0.
 *  - Returns an array of objects: { deviceId, failureCount }
 *
 * Note: We use MongoDB aggregation to group by deviceId and count failures.
 */
const getDevicesWithRepeatedFailures = async (req, res, next) => {
  try {
    const aggregationPipeline = [
      {
        $match: {
          totalErrors: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$deviceId',
          failureCount: { $sum: 1 },
        },
      },
      {
        $match: {
          failureCount: { $gt: 3 },
        },
      },
      {
        $project: {
          _id: 0,
          deviceId: '$_id',
          failureCount: 1,
        },
      },
      {
        $sort: { failureCount: -1 },
      },
    ];

    const results = await SyncEvent.aggregate(aggregationPipeline);

    return res.status(200).json({
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSyncEvent,
  getSyncHistory,
  getDevicesWithRepeatedFailures,
};
