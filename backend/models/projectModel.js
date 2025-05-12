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

// Add a method to get task counts for each member
projectSchema.methods.getMemberTaskCounts = async function() {
  const Task = mongoose.model('Task');
  
  // Get all tasks for this project
  const tasks = await Task.find({ project: this._id });
  
  // Create a map to store task counts for each member
  const memberTaskCounts = {};
  
  // Initialize counts for each member
  this.members.forEach(member => {
    const memberId = member.user.toString();
    memberTaskCounts[memberId] = {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0
    };
  });
  
  // Count tasks for each member
  tasks.forEach(task => {
    const assignedTo = task.assignedTo.toString();
    if (memberTaskCounts[assignedTo]) {
      memberTaskCounts[assignedTo].total += 1;
      
      // Count by status
      if (task.status === 'Completed') {
        memberTaskCounts[assignedTo].completed += 1;
      } else if (task.status === 'In Progress') {
        memberTaskCounts[assignedTo].inProgress += 1;
      } else if (task.status === 'To Do') {
        memberTaskCounts[assignedTo].todo += 1;
      }
    }
  });
  
  return memberTaskCounts;
};

// Calculate project progress based on task completion
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  
  const totalTasks = await Task.countDocuments({ project: this._id });
  if (totalTasks === 0) return 0;
  
  const completedTasks = await Task.countDocuments({ 
    project: this._id,
    status: 'Completed'
  });
  
  return Math.round((completedTasks / totalTasks) * 100);
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;