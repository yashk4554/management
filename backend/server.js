require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./utils/db');

// Middleware
app.use(cors());
app.use(express.json());

// JWT authentication middleware
const auth = require('./middleware/auth');


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', auth, require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/', require('./routes/log'));


// Error handling middleware (global)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});


// MongoDB connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
