// ============================================
// SMART PROGRESS TRACKER - MAIN SERVER FILE
// ============================================
// Yeh file application ka entry point hai
// Express server setup, middleware configuration,
// route mounting, aur error handling yahan hota hai

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
// Yeh line .env file ke saare variables ko process.env mein daal deti hai
dotenv.config();

// Create Express application instance
const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
// MongoDB se connect karo using mongoose
// Agar connection fail ho, server start nahi hoga
connectDB();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS Configuration
// Frontend (React on port 5173) ko backend se baat karne ki permission
// Bina CORS ke browser cross-origin requests block kar dega
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
// Request body mein aane wale JSON data ko parse karta hai
// Bina iske req.body undefined rahega
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Morgan Logger - Development mein HTTP requests log karta hai
// Terminal mein dikhega: GET /api/tasks 200 15ms
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// API ROUTES
// ============================================
// Har route file ek specific feature handle karti hai

// Auth Routes - Login, Register, Profile
app.use('/api/auth', require('./routes/authRoutes'));

// Task Routes - CRUD operations for daily tasks
app.use('/api/tasks', require('./routes/taskRoutes'));

// Progress Routes - Weighted progress calculations
app.use('/api/progress', require('./routes/progressRoutes'));

// Planner Routes - Weekly goals and planning
app.use('/api/planner', require('./routes/plannerRoutes'));

// Analytics Routes - Charts, heatmaps, insights data
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ============================================
// HEALTH CHECK ROUTE
// ============================================
// Server alive hai ya nahi check karne ke liye
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Progress Tracker API is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ============================================
// 404 HANDLER
// ============================================
// Agar koi route match nahi karta toh yeh response jayega
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found on this server`
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
// Saari unhandled errors yahan aayengi
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║   🚀 Smart Progress Tracker Server       ║
    ║   📡 Port: ${PORT}                          ║
    ║   🌍 Mode: ${process.env.NODE_ENV || 'development'}               ║
    ║   ✅ Server is running successfully!      ║
    ╚══════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
// Agar koi async error catch nahi hota toh server gracefully shutdown ho
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});