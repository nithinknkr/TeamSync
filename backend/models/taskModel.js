const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A subtask must have a title'],
    trim: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A task must have a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Blocked', 'Completed'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isPersonal: {
    type: Boolean,
    default: true
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A task must be assigned to a user']
  },
  assignedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  subtasks: [subtaskSchema],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate progress based on subtasks
taskSchema.pre('save', function(next) {
  if (this.subtasks && this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(
      subtask => subtask.status === 'Completed'
    ).length;
    
    this.progress = Math.round((completedSubtasks / this.subtasks.length) * 100);
  }
  
  next();
});

// Index for faster queries
taskSchema.index({ assignedTo: 1, dueDate: 1 });
taskSchema.index({ project: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;