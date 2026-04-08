// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// Har protected route pe yeh middleware chalega
// JWT token verify karega aur user ko req.user mein daalega
// Token nahi hai ya invalid hai toh 401 error jayega

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // ============================================
    // STEP 1: Token extract karo
    // ============================================
    // Token Authorization header mein aata hai
    // Format: "Bearer <token>"
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        // "Bearer eyJhbGciOiJ..." se sirf token part nikalo
        token = req.headers.authorization.split(' ')[1];
    }

    // Agar token nahi mila toh unauthorized error
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided. Please login first.'
        });
    }

    try {
        // ============================================
        // STEP 2: Token verify karo
        // ============================================
        // jwt.verify() token ko secret key se decode karta hai
        // Agar token tampered hai ya expired hai toh error throw hoga
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ============================================
        // STEP 3: User find karo database se
        // ============================================
        // Token mein sirf user id hai, baaki info DB se laao
        // .select('-password') means password field include mat karo
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token may be invalid.'
            });
        }

        // ============================================
        // STEP 4: User ko request mein attach karo
        // ============================================
        // Ab aage ke route handlers mein req.user available hoga
        req.user = user;

        // Next middleware/route handler pe jaao
        next();

    } catch (error) {
        // Token invalid ya expired hai
        console.error('Auth Middleware Error:', error.message);
        
        let message = 'Not authorized. Invalid token.';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired. Please login again.';
        }
        
        return res.status(401).json({
            success: false,
            message: message
        });
    }
};

module.exports = protect;