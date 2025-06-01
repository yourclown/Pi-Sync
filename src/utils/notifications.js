const SyncEvent = require('../models/SyncEvent');


const checkThreeConsecutiveFailures = async (deviceId) => {
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

    }
  }
};

module.exports = {
  checkThreeConsecutiveFailures,
};
