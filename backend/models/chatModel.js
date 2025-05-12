const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A message must have a sender']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: [true, 'A message must belong to a project']
  },
  isTeamChat: {
    type: Boolean,
    default: true, // true for team chat, false for personal chat with lead
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // Only required for personal chats (when isTeamChat is false)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
chatMessageSchema.index({ project: 1, isTeamChat: 1, createdAt: -1 });
chatMessageSchema.index({ project: 1, sender: 1, recipient: 1, isTeamChat: 1, createdAt: -1 });

// Pre-save middleware to validate recipient field for personal chats
chatMessageSchema.pre('save', function(next) {
  // If this is a personal chat, ensure there's a recipient
  if (this.isTeamChat === false && !this.recipient) {
    return next(new Error('Recipient is required for personal chats'));
  }
  next();
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage; 