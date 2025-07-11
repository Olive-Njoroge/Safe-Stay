const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');  // <-- NEW
const { Server } = require('socket.io');  // <-- NEW
const connectDB = require('./config/db');
const cors = require('cors');  // <-- Optional but recommended

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());  // Allow frontend to connect (adjust origin in production)

// Import Routes
const billRoutes = require('./routes/billsRoute');
const tenantRoutes = require('./routes/tenantRoute');
const landlordRoutes = require('./routes/landlordRoute');
const complaintRoutes = require('./routes/complaintRoute');
const chatRoutes = require('./routes/chatRoutes');  // <-- NEW

app.use('/api/bills', billRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chats', chatRoutes);  // <-- NEW

// Test Route
app.get('/', (req, res) => {
  res.send('Home Management Backend Running');
});

// Create HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // For development — tighten for production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Import Socket Handler
const chatSocket = require('./socket/index');
chatSocket(io);  // Call the socket logic

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
