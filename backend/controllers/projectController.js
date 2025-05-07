const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Get all projects for a user
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all projects where the user is a member
    const projects = await Project.find({
      'members.user': userId
    }).sort({ lastActivity: -1 });
    
    // For each project, get the count of tasks assigned to the user
    const projectsWithTaskCount = await Promise.all(
      projects.map(async project => {
        const taskCount = await Task.countDocuments({
          project: project._id,
          assignedTo: userId
        });
        
        // Determine the user's role in the project
        const userMember = project.members.find(
          member => member.user.toString() === userId
        );
        
        return {
          ...project.toObject(),
          taskCount,
          userRole: userMember ? userMember.role : 'Member'
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      results: projectsWithTaskCount.length,
      data: {
        projects: projectsWithTaskCount
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    // Set the current user as the project lead
    const projectData = {
      ...req.body,
      lead: req.user.id,
      members: [{ user: req.user.id, role: 'Lead' }]
    };
    
    const newProject = await Project.create(projectData);
    
    res.status(201).json({
      status: 'success',
      data: {
        project: newProject
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add a task to a project
exports.addProjectTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Check if the project exists and the user is a member
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if the user is a member of the project
    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Create the task
    const taskData = {
      ...req.body,
      isPersonal: false,
      project: projectId,
      assignedBy: req.user.id
    };
    
    const newTask = await Task.create(taskData);
    
    // Update the project's lastActivity
    project.lastActivity = Date.now();
    await project.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        task: newTask
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add these controller functions if they don't exist

// Get a single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user is a member of the project
    const isMember = project.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember && project.lead.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this project'
      });
    }
    
    // Add user role to the response
    const userRole = project.lead.toString() === req.user.id 
      ? 'Lead' 
      : project.members.find(member => member.user.toString() === req.user.id)?.role || 'Member';
    
    res.status(200).json({
      status: 'success',
      data: {
        project: {
          ...project._doc,
          userRole
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get project tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user is a member of the project
    const isMember = project.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember && project.lead.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this project'
      });
    }
    
    const tasks = await Task.find({ 
      project: req.params.id,
      isPersonal: false
    }).populate('assignedTo', 'name email');
    
    res.status(200).json({
      status: 'success',
      data: {
        tasks
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get project members
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('lead', 'name email')
      .populate('members.user', 'name email');
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user is a member of the project
    const isMember = project.members.some(member => 
      member.user._id.toString() === req.user.id
    );
    
    if (!isMember && project.lead._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this project'
      });
    }
    
    // Format members data
    const members = [
      {
        user: project.lead,
        role: 'Lead',
        joinedAt: project.createdAt
      },
      ...project.members.map(member => ({
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        members
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add this controller function for project invitations

exports.inviteToProject = async (req, res) => {
  try {
    const { emails, message } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide at least one email address'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user is the project lead
    if (project.lead.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only the project lead can send invitations'
      });
    }
    
    // Get the inviter's name
    const inviter = await User.findById(req.user.id);
    
    // Generate invitation link
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${project._id}`;
    
    // Send invitation emails
    const emailPromises = emails.map(async (email) => {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      // Create HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Project Invitation</h2>
          <p>Hello,</p>
          <p>${inviter.name} has invited you to join the project "${project.name}" on TeamSync.</p>
          <p>${message || ''}</p>
          <p>Click the button below to join:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 15px 0;">Join Project</a>
          <p>If you don't have an account yet, you'll need to sign up first.</p>
          <p>Thank you,<br>TeamSync Team</p>
        </div>
      `;
      
      return sendEmail({
        email,
        subject: `Invitation to join project: ${project.name}`,
        message: `${inviter.name} has invited you to join the project "${project.name}" on TeamSync. ${message || ''} Join here: ${inviteLink}`,
        html: htmlContent
      });
    });
    
    await Promise.all(emailPromises);
    
    res.status(200).json({
      status: 'success',
      message: 'Invitations sent successfully'
    });
  } catch (err) {
    console.error('Invitation error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send invitations. Please try again.'
    });
  }
};