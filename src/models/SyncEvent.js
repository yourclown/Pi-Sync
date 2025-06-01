// src/models/SyncEvent.js
const mongoose = require('mongoose');

const SyncEventSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    totalFilesSync: {
      type: Number,
      required: true,
      min: 0,
    },
    totalErrors: {
      type: Number,
      required: true,
      min: 0,
    },
    internetSpeed: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'sync_events',
  }
);

SyncEventSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SyncEvent', SyncEventSchema);
