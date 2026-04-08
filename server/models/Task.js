// ============================================
// TASK MODEL
// ============================================
// System ka CORE data model - user ka har task yahan store hota hai
// Skill tag, time tracking, difficulty, completion - sab yahan hai
// Progress calculation ka raw data yahi hai

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // Kis user ka task hai - reference to User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',           // User model se link
        required: true,
        index: true            // Fast lookup ke liye index
    },

    // Task ka title/name
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    // Task ka description (optional)
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },

    // SKILL TAG - Yeh bahut important hai
    // Progress skill-wise calculate hoga
    // Example: "React", "Node.js", "DSA", "Python", "System Design"
    skill: {
        type: String,
        required: [true, 'Skill tag is required'],
        trim: true
    },

    // CATEGORY - Broad category
    category: {
        type: String,
        enum: ['learning', 'practice', 'project', 'revision', 'other'],
        default: 'learning'
    },

    // PLANNED TIME - User ne kitna time plan kiya tha (minutes mein)
    plannedTime: {
        type: Number,
        required: [true, 'Planned time is required'],
        min: [1, 'Minimum 1 minute'],
        max: [720, 'Maximum 12 hours (720 minutes)']
    },

    // ACTUAL TIME - Actually kitna time laga (minutes mein)
    // Initially 0 hoga, task complete karne ke baad update hoga
    actualTime: {
        type: Number,
        default: 0,
        min: [0, 'Time cannot be negative'],
        max: [720, 'Maximum 12 hours']
    },

    // DIFFICULTY LEVEL - Progress calculation mein weight deta hai
    // Hard tasks ka score zyada hoga
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: [true, 'Difficulty level is required'],
        default: 'medium'
    },

    // COMPLETION PERCENTAGE - 0 to 100
    // User khud set karega ki kitna complete hua
    completion: {
        type: Number,
        default: 0,
        min: [0, 'Minimum 0%'],
        max: [100, 'Maximum 100%']
    },

    // TASK STATUS
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'skipped'],
        default: 'pending'
    },

    // QUALITY RATING - Self assessment (1-5 stars)
    // Optional but helps in better progress calculation
    qualityRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },

    // NOTES - Task ke baare mein additional notes
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        default: ''
    },

    // DATE - Kis din ka task hai
    date: {
        type: Date,
        required: [true, 'Task date is required'],
        index: true            // Date-wise queries fast hongi
    },

    // CALCULATED SCORE - Backend calculate karega
    // Formula: (actualTime / 60) × difficultyMultiplier × (completion / 100)
    taskScore: {
        type: Number,
        default: 0
    }
}, {
    // Schema options
    timestamps: true           // createdAt aur updatedAt automatically add hoga
});

// ============================================
// COMPOUND INDEX
// ============================================
// User + Date ke combination pe fast query hogi
// Jab weekly/daily tasks fetch karna ho
TaskSchema.index({ userId: 1, date: -1 });
TaskSchema.index({ userId: 1, skill: 1 });

// ============================================
// PRE-SAVE MIDDLEWARE - CALCULATE TASK SCORE
// ============================================
// Jab bhi task save ho, automatically score calculate karo
// Yeh WEIGHTED PROGRESS SYSTEM ka core formula hai

TaskSchema.pre('save', function(next) {
    // Difficulty multiplier mapping
    // Hard tasks ko zyada weightage milega
    const difficultyMultiplier = {
        'easy': 1.0,      // Normal weightage
        'medium': 1.5,    // 1.5x weightage
        'hard': 2.5       // 2.5x weightage - bahut important tasks
    };

    // FORMULA: Task Score = (actualTime in hours) × difficultyMultiplier × (completion%)
    // Example: 2 hours × 1.5 (medium) × 0.8 (80% complete) = 2.4 score
    const timeInHours = this.actualTime / 60;
    const multiplier = difficultyMultiplier[this.difficulty] || 1;
    const completionFactor = this.completion / 100;

    this.taskScore = parseFloat((timeInHours * multiplier * completionFactor).toFixed(2));

    // Auto-update status based on completion
    if (this.completion === 100) {
        this.status = 'completed';
    } else if (this.completion > 0) {
        this.status = 'in-progress';
    }

    next();
});

// ============================================
// STATIC METHOD: Get tasks for a date range
// ============================================
TaskSchema.statics.getTasksByDateRange = function(userId, startDate, endDate) {
    return this.find({
        userId: userId,
        date: {
            $gte: startDate,    // Greater than or equal to start
            $lte: endDate       // Less than or equal to end
        }
    }).sort({ date: -1 });      // Newest first
};

// ============================================
// STATIC METHOD: Get skill-wise aggregation
// ============================================
TaskSchema.statics.getSkillAnalysis = function(userId, startDate, endDate) {
    return this.aggregate([
        {
            // Step 1: Filter - sirf is user ke tasks, date range mein
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            // Step 2: Group by skill
            $group: {
                _id: '$skill',                                    // Skill ke naam se group
                totalTime: { $sum: '$actualTime' },               // Total time spent
                totalScore: { $sum: '$taskScore' },               // Total weighted score
                taskCount: { $sum: 1 },                           // Kitne tasks the
                avgCompletion: { $avg: '$completion' },           // Average completion %
                avgDifficulty: {                                  // Difficulty distribution
                    $push: '$difficulty'
                }
            }
        },
        {
            // Step 3: Sort by total score (highest first)
            $sort: { totalScore: -1 }
        }
    ]);
};

module.exports = mongoose.model('Task', TaskSchema);