// ============================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================
// Express mein 4 parameter wala middleware error handler hota hai
// Saari unhandled errors yahan aati hain

const errorHandler = (err, req, res, next) => {
    // Error details log karo (development mein)
    console.error('❌ Error:', err);

    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ============================================
    // MONGOOSE SPECIFIC ERRORS
    // ============================================

    // Mongoose Validation Error
    // Jab required field missing ho ya validation fail ho
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Saari validation errors ek string mein combine karo
        const messages = Object.values(err.errors).map(error => error.message);
        message = messages.join('. ');
    }

    // Mongoose Cast Error (Invalid ObjectId)
    // Jab galat format ka ID diya ho
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose Duplicate Key Error
    // Jab unique field mein duplicate value daali ho (like email)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists. Please use a different ${field}.`;
    }

    // ============================================
    // JWT ERRORS
    // ============================================
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // ============================================
    // SEND ERROR RESPONSE
    // ============================================
    res.status(statusCode).json({
        success: false,
        message: message,
        // Development mein full error stack bhi bhejo debugging ke liye
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;