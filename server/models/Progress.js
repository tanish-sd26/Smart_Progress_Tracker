const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  skills: [{
    name: String,
    hours: Number
  }],
  tasksCompleted: { type: Number, default: 0 },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);