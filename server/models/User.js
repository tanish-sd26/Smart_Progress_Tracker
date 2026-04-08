// ============================================
// USER MODEL
// ============================================
// User ka complete schema - authentication aur profile
// Password hashing, JWT generation, aur password matching
// sab yahan handle hota hai

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    // User ka naam - required hai
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,        // Extra spaces remove karo
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },

    // Email - unique hona chahiye, login ke liye use hoga
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,       // Duplicate emails allowed nahi
        lowercase: true,    // Always lowercase mein store karo
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },

    // Password - hashed form mein store hoga
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false       // By default queries mein password nahi aayega
    },

    // User ke skills jo woh track karna chahta hai
    // Registration ke baad bhi add kar sakta hai
    skills: [{
        type: String,
        trim: true
    }],

    // Career goal - job readiness calculate karne mein help karega
    careerGoal: {
        type: String,
        trim: true,
        default: ''
    },

    // Daily target hours - planning ke liye
    dailyTargetHours: {
        type: Number,
        default: 4,
        min: [1, 'Minimum 1 hour target'],
        max: [16, 'Maximum 16 hours target']
    },

    // Account creation date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// PRE-SAVE MIDDLEWARE - PASSWORD HASHING
// ============================================
// Jab bhi user save ho (create ya update), password hash karo
// Plain text password KABHI store nahi karna - security risk hai

UserSchema.pre('save', async function(next) {
    // Agar password modify nahi hua toh skip karo
    // Yeh tab hota hai jab sirf name ya email update ho
    if (!this.isModified('password')) {
        return next();
    }

    // Salt generate karo - random string jo hash mein add hota hai
    // 12 rounds = strong security with reasonable speed
    const salt = await bcrypt.genSalt(12);
    
    // Password ko hash karo salt ke saath
    // Original password ab recoverable nahi hai
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

// ============================================
// METHOD: Generate JWT Token
// ============================================
// Login successful hone ke baad token generate karo
// Yeh token har request ke saath bheja jayega authentication ke liye

UserSchema.methods.generateAuthToken = function() {
    // jwt.sign() token create karta hai
    // Payload mein user ki id daalo
    // Secret key se sign karo
    // Expiry set karo
    return jwt.sign(
        { id: this._id },                    // Payload - token mein store hoga
        process.env.JWT_SECRET,               // Secret key - .env se
        { expiresIn: process.env.JWT_EXPIRE } // Expiry - 30 days
    );
};

// ============================================
// METHOD: Match Password
// ============================================
// Login ke time user ka entered password compare karo
// Stored hash ke saath

UserSchema.methods.matchPassword = async function(enteredPassword) {
    // bcrypt.compare() hashed password ko entered password se compare karta hai
    // Returns true/false
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);