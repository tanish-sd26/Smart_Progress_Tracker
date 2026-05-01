// ============================================
// SMART PROGRESS TRACKER - MAIN SERVER FILE
// ============================================

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Create Express application instance
const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS Configuration

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Terminal : GET /api/tasks 200 15ms
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// API ROUTES
// ============================================

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
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Progress Tracker API is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

app.get("/", (req, res) => {
    res.send("🚀 Smart Progress Tracker API is LIVE!");
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

process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});