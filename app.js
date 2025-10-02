require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
// const storageRoutes = require('./routes/gallery');
const messAutomationRoutes = require('./routes/messAutomationRoutes')
const cors = require('cors');
const path  = require('path');

const app = express();
app.use(cors());
app.use(express.json());  // To parse JSON body requests

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Define routes
app.use('/api/auth', authRoutes);
// app.use('/api/storage',storageRoutes);
app.use('/api/mess', messAutomationRoutes)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
