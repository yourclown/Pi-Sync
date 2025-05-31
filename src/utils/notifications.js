// src/utils/notifications.js
const SyncEvent = require('../models/SyncEvent');

/**
 * Checks if a device has 3 consecutive failed syncs (totalErrors > 0).
 * If yes, logs a console warning. This runs after each new SyncEvent is created.
 *
 * @param {String} deviceId
 */
const checkThreeConsecutiveFailures = async (deviceId) => {
  // Fetch the latest 3 events for this device, ordered by timestamp descending
  const lastThree = await SyncEvent.find({ deviceId })
    .sort({ timestamp: -1 })
    .limit(3)
    .lean();

  if (lastThree.length === 3) {
    const allFailed = lastThree.every(event => event.totalErrors > 0);
    if (allFailed) {
      console.warn(
        `[Notification] Device "${deviceId}" has failed to sync 3 times in a row.`
      );
      // Additional logic could go here (email, push, etc.)
    }
  }
};

module.exports = {
  checkThreeConsecutiveFailures,
};
