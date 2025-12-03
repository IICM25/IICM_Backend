// const authRoutes = require('./routes/auth');
// // const storageRoutes = require('./routes/gallery');
// const messAutomationRoutes = require('./routes/messAutomationRoutes')
// const cors = require('cors');
// const path  = require('path');

// const app = express();
// app.use(cors());
// app.use(express.json());  // To parse JSON body requests

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// // Define routes
// app.use('/api/auth', authRoutes);
// // app.use('/api/storage',storageRoutes);
// app.use('/api/mess', messAutomationRoutes)


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Routes import
const authRoutes = require('./routes/auth');
const messAutomationRoutes = require('./routes/messAutomationRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/mess', messAutomationRoutes);
app.use('/api/events', eventRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});
const db = require('./config/db');

const checkDbConnection = async () => {
  try {
    const [rows] = await db.query('SELECT NOW() AS currentTime');
    console.log('✅ Database connected successfully! Current time:', rows[0].currentTime);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

checkDbConnection();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0' , () => {console.log(`Server is running on port ${process.env.PORT || 3000}`);});


