const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A project must have a name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  workspaceCode: {
    type: String,
    default: function() {
      return 'WS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  },
  lead: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A project must have a lead']
  },
  members: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Lead', 'Member'],
      default: 'Member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to ensure lead is also a member
projectSchema.pre('save', function(next) {
  // Check if lead exists in members array
  const leadExists = this.members.some(member => 
    member.user.toString() === this.lead.toString()
  );
  
  // If lead is not in members array, add them
  if (!leadExists) {
    this.members.push({
      user: this.lead,
      role: 'Lead',
      joinedAt: this.createdAt
    });
  }
  
  next();
});

// Virtual property to calculate progress
projectSchema.virtual('progress').get(function() {
  // This would be calculated based on tasks in the project
  // For now, we'll return a placeholder
  return 0;
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;