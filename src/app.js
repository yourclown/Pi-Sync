require('dotenv').config(); 
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const syncEventRoutes = require('./routes/syncEventRoutes');

const app = express();

app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'PiSync Backend is running.' });
});

app.use('/api', syncEventRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
