const ChatMessage = require('../models/chatModel');
const Project = require('../models/projectModel');
const mongoose = require('mongoose');

// Helper function to check if user is a member of the project
const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  
  return project.members.some(member => member.user.toString() === userId.toString());
};

// Get project lead
const getProjectLead = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  
  return project.lead;
};

// Send a message in team chat
exports.sendTeamMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if user is member of the project
    if (!(await isProjectMember(projectId, userId))) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Create the message
    const message = await ChatMessage.create({
      content,
      sender: userId,
      project: projectId,
      isTeamChat: true
    });
    
    // Populate sender details
    await message.populate('sender', 'name');
    
    // If Socket.IO is available, emit the message
    if (req.app.get('io')) {
      req.app.get('io').to(`project-${projectId}`).emit('newTeamMessage', message);
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Send a personal message to team lead
exports.sendPersonalMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if user is member of the project
    if (!(await isProjectMember(projectId, userId))) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Get project lead
    const leadId = await getProjectLead(projectId);
    if (!leadId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project lead not found'
      });
    }
    
    // If user is the lead, don't allow sending messages to self
    if (userId.toString() === leadId.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot send personal messages to yourself'
      });
    }
    
    // Create the message
    const message = await ChatMessage.create({
      content,
      sender: userId,
      project: projectId,
      isTeamChat: false,
      recipient: leadId
    });
    
    // Populate sender and recipient details
    await message.populate([
      { path: 'sender', select: 'name' },
      { path: 'recipient', select: 'name' }
    ]);
    
    // If Socket.IO is available, emit the message
    if (req.app.get('io')) {
      req.app.get('io').to(`project-${projectId}`).emit('newPersonalMessage', message);
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get team chat messages
exports.getTeamMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if user is member of the project
    if (!(await isProjectMember(projectId, userId))) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Get messages for team chat, sorted by creation time
    const messages = await ChatMessage.find({
      project: projectId,
      isTeamChat: true
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name');
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get personal chat messages between member and lead
exports.getPersonalMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if user is member of the project
    if (!(await isProjectMember(projectId, userId))) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Get project lead
    const leadId = await getProjectLead(projectId);
    if (!leadId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project lead not found'
      });
    }
    
    let query;
    
    // If the user is the lead, get all messages where they are the recipient
    if (userId.toString() === leadId.toString()) {
      query = {
        project: projectId,
        isTeamChat: false,
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      };
    } else {
      // If user is a member, get only their personal messages with the lead
      query = {
        project: projectId,
        isTeamChat: false,
        $or: [
          { sender: userId, recipient: leadId },
          { sender: leadId, recipient: userId }
        ]
      };
    }
    
    // Get messages
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('recipient', 'name');
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages,
        isLead: userId.toString() === leadId.toString()
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// For team leads - get all personal conversations
exports.getPersonalConversations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if user is the lead
    const leadId = await getProjectLead(projectId);
    if (!leadId || leadId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only project leads can view all personal conversations'
      });
    }
    
    // Get distinct senders who have sent messages to the lead
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          project: mongoose.Types.ObjectId(projectId),
          isTeamChat: false,
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$content' },
          lastMessageDate: { $max: '$createdAt' }
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      {
        $project: {
          member: { $arrayElemAt: ['$memberDetails', 0] },
          lastMessage: 1,
          lastMessageDate: 1
        }
      },
      {
        $project: {
          'member._id': 1,
          'member.name': 1,
          lastMessage: 1,
          lastMessageDate: 1
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: conversations.length,
      data: {
        conversations
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 