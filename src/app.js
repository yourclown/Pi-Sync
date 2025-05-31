// src/app.js
require('dotenv').config(); // loads .env into process.env
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const syncEventRoutes = require('./routes/syncEventRoutes');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
connectDB();

// Base route (health check)
app.get('/', (req, res) => {
  res.json({ message: 'PiSync Backend is running.' });
});

// Sync event routes (all prefixed)
app.use('/api', syncEventRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
