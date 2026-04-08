// ============================================
// PROGRESS SNAPSHOT MODEL
// ============================================
// Weekly/Monthly progress snapshots store karta hai
// Yeh long-term trends track karne ke liye hai
// Har week end pe ek snapshot save hota hai

const mongoose = require('mongoose');

const ProgressSnapshotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Snapshot kis period ka hai
    periodType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },

    // Period start date
    periodStart: {
        type: Date,
        required: true
    },

    // Period end date
    periodEnd: {
        type: Date,
        required: true
    },

    // ===== CORE METRICS =====

    // Total tasks in this period
    totalTasks: {
        type: Number,
        default: 0
    },

    // Completed tasks
    completedTasks: {
        type: Number,
        default: 0
    },

    // Total actual time spent (minutes)
    totalTimeSpent: {
        type: Number,
        default: 0
    },

    // Total weighted score
    totalScore: {
        type: Number,
        default: 0
    },

    // Progress percentage
    // Formula: (totalScore / expectedScore) × 100
    progressPercentage: {
        type: Number,
        default: 0
    },

    // ===== SKILL BREAKDOWN =====
    skillBreakdown: [{
        skill: String,
        timeSpent: Number,      // minutes
        score: Number,
        taskCount: Number,
        avgCompletion: Number,
        strength: {             // 'strong', 'medium', 'weak'
            type: String,
            enum: ['strong', 'medium', 'weak']
        }
    }],

    // ===== CONSISTENCY METRICS =====
    consistency: {
        // Kitne din kaam kiya
        activeDays: {
            type: Number,
            default: 0
        },
        // Total days in period
        totalDays: {
            type: Number,
            default: 7
        },
        // Current streak
        currentStreak: {
            type: Number,
            default: 0
        },
        // Consistency percentage
        consistencyPercentage: {
            type: Number,
            default: 0
        }
    },

    // ===== JOB READINESS =====
    jobReadinessScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Compound index
ProgressSnapshotSchema.index({ userId: 1, periodType: 1, periodStart: -1 });

module.exports = mongoose.model('ProgressSnapshot', ProgressSnapshotSchema);