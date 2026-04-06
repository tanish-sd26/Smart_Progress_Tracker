// ============================================
// MAIN SERVER FILE - Entry Point
// ============================================
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS - allows frontend to communicate with backend
// This is essential when frontend runs on port 5173 (Vite)
// and backend runs on port 5000
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON requests
// When frontend sends data as JSON, this middleware converts it
// to JavaScript object accessible via req.body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// HTTP request logger - shows request method, URL, status code in console
// Helpful for debugging during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// API ROUTES
// ============================================
// Each route file handles a specific domain of the application

// Authentication routes - login, register, profile
app.use('/api/auth', require('./routes/authRoutes'));

// Task routes - CRUD operations for daily tasks
app.use('/api/tasks', require('./routes/taskRoutes'));

// Progress routes - calculated progress data
app.use('/api/progress', require('./routes/progressRoutes'));

// Planner routes - weekly goals and planning
app.use('/api/planner', require('./routes/plannerRoutes'));

// Analytics routes - charts data, heatmaps, summaries
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ============================================
// HEALTH CHECK ROUTE
// ============================================
// Simple route to verify server is running
// Useful for deployment platforms that ping your server
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Progress Tracker API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 - Route not found
// This catches any request that doesn't match defined routes
app.use((req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Global error handler middleware
// This catches all errors thrown in the application
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   Smart Progress Tracker API Server        ║
    ║   Running on port: ${PORT}                    ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}             ║
    ║   MongoDB: Connected ✓                     ║
    ╚════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
// This prevents the server from silently failing
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});