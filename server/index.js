const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import Routes
const billRoutes = require('./routes/billsRoute');
app.use('/api/bills', billRoutes);

const tenantRoutes = require('./routes/tenantRoute');
app.use('/api/tenants', tenantRoutes);

const landlordRoutes = require('./routes/landlordRoute');
app.use('/api/landlord', landlordRoutes)

const complaintRoutes = require('./routes/complaintRoute');
app.use('/api/complaints', complaintRoutes);

// Test Route (optional)
app.get('/', (req, res) => {
  res.send('Home Management Backend Running');
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
