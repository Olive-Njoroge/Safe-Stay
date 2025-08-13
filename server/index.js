const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');  // <-- NEW
const { Server } = require('socket.io');  // <-- NEW
const connectDB = require('./config/db');
const cors = require('cors');  // <-- Optional but recommended
const compression = require('compression'); // Add compression

dotenv.config();

// Debug: Check if JWT_SECRET is loaded
console.log('🔑 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('🔑 JWT_SECRET preview:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 20) + '...' : 'NONE');

// Connect to MongoDB
connectDB();

const app = express();

// Performance optimizations
app.use(compression()); // Compress all responses
app.use(express.json({ limit: '5mb' })); // Optimize JSON parsing
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://safe-stay-frontend.onrender.com', 
        'https://safestay.onrender.com',
        'https://safe-stay-pink.vercel.app',
        /^https:\/\/.*\.vercel\.app$/  // Allow all Vercel deployments
      ] 
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cache control headers for better performance
app.use((req, res, next) => {
  // Cache API responses for 5 minutes (except auth routes)
  if (req.url.startsWith('/api') && !req.url.includes('/auth/')) {
    res.set('Cache-Control', 'public, max-age=300');
  }
  next();
});

// Import Routes
const billRoutes = require('./routes/billsRoute');
const complaintRoutes = require('./routes/complaintRoute');
const chatRoutes = require('./routes/chatRoutes'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rulesRoutes = require('./routes/rulesRoute');
const apartmentRoutes = require('./routes/apartmentRoutes');
const ussdRoutes = require('./routes/ussdRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');

app.use('/api/bills', billRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', testRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Home Management Backend Running');
});

// Health check endpoint with explicit CORS
app.get('/health', (req, res) => {
  // Add explicit CORS headers for health check
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    ussdCode: process.env.USSD_CODE || 'Not configured',
    memory: process.memoryUsage(),
    performance: {
      responseTime: process.hrtime(),
      cpuUsage: process.cpuUsage()
    }
  });
});

// Handle preflight OPTIONS requests for health endpoint
app.options('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Keep-alive for Render free tier (optimized)
if (process.env.NODE_ENV === 'production') {
  const keepAlive = () => {
    const url = process.env.BASE_URL || 'https://safe-stay-backend.onrender.com';
    fetch(`${url}/health`)
      .then(res => {
        if (res.ok) {
          console.log(`✓ Keep-alive: ${res.status}`);
        }
      })
      .catch(err => console.log(`✗ Keep-alive failed: ${err.message}`));
  };
  
  // Ping every 14 minutes to prevent sleeping
  const keepAliveInterval = setInterval(keepAlive, 14 * 60 * 1000);
  console.log('🔄 Keep-alive enabled for production');
  
  // Cleanup on exit
  process.on('SIGTERM', () => {
    clearInterval(keepAliveInterval);
  });
}

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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 USSD Code: ${process.env.USSD_CODE || 'Not configured'}`);
});
