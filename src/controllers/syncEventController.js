const SyncEvent = require('../models/SyncEvent');
const { checkThreeConsecutiveFailures } = require('../utils/notifications');
const mongoose = require('mongoose');

const createSyncEvent = async (req, res, next) => {
  try {
    const { deviceId, timestamp, totalFilesSync, totalErrors, internetSpeed } =
      req.body;

    const newEvent = await SyncEvent.create({
      deviceId,
      timestamp,
      totalFilesSync,
      totalErrors,
      internetSpeed,
    });

    await checkThreeConsecutiveFailures(deviceId);

    return res.status(201).json({
      message: 'Sync event recorded successfully.',
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

const getSyncHistory = async (req, res, next) => {
  try {
    const deviceId = req.params.id;
    let { page = 1, limit = 50 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

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
