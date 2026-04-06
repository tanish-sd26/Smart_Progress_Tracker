const mongoose = require('mongoose');

const weeklyGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  goals: [{
    skill: String,
    targetHours: Number,
    actualHours: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeeklyGoal', weeklyGoalSchema);