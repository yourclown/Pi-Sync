// src/config/db.js


const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB using MONGODB_URI from process.env.
 * Export the connection function.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(uri);
    if (!uri) {
      throw new Error('MONGODB_URI not set in environment.');
    }

    mongoose.set('strictQuery', true);


    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options can be added here for production
    });

    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
