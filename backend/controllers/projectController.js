const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

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

// Get public project info
exports.getPublicProjectInfo = async (req, res) => {
  try {
    console.log(`Getting public info for project ID: ${req.params.id}`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid project ID format'
      });
    }
    
    // Get full project with members to check membership
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      console.log(`Project not found: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // If user is authenticated, check if they're already a member
    let isMember = false;
    if (req.user) {
      console.log(`Checking if user ${req.user.id} is a member of project ${project._id}`);
      isMember = project.members.some(member => 
        member.user.toString() === req.user.id
      );
      console.log(`User is${isMember ? '' : ' not'} a member of this project`);
    }
    
    console.log(`Returning public info for project: ${project.name}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          workspaceCode: project.workspaceCode,
          isMember: isMember
        }
      }
    });
  } catch (err) {
    console.error(`Error in getPublicProjectInfo: ${err.message}`);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Join a project
exports.joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user is already a member
    const isMember = project.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (isMember) {
      // Return success but with a different message
      return res.status(200).json({
        status: 'success',
        alreadyMember: true,
        message: 'You are already a member of this project'
      });
    }
    
    // Add user to project members
    project.members.push({
      user: req.user.id,
      role: 'Member',
      joinedAt: Date.now()
    });
    
    // Update last activity
    project.lastActivity = Date.now();
    
    await project.save();
    
    res.status(200).json({
      status: 'success',
      message: 'You have successfully joined the project'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

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
    
    if (!isMember) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a member of this project'
      });
    }
    
    // Get all member user IDs
    const memberIds = project.members.map(member => member.user);
    
    // Fetch member details from User model
    const memberUsers = await User.find({ _id: { $in: memberIds } })
      .select('name email');
    
    // Get task counts for each member
    const memberTaskCounts = await Promise.all(
      memberIds.map(async (userId) => {
        const count = await Task.countDocuments({
          project: project._id,
          assignedTo: userId
        });
        
        // Get task status breakdown
        const completed = await Task.countDocuments({
          project: project._id,
          assignedTo: userId,
          status: 'Completed'
        });
        
        const inProgress = await Task.countDocuments({
          project: project._id,
          assignedTo: userId,
          status: 'In Progress'
        });
        
        const todo = await Task.countDocuments({
          project: project._id,
          assignedTo: userId,
          status: 'To Do'
        });
        
        return {
          userId: userId.toString(),
          taskCount: count,
          taskStatus: {
            completed,
            inProgress,
            todo
          }
        };
      })
    );
    
    // Combine user details with role information and task counts
    const membersWithRoles = memberUsers.map(user => {
      const memberInfo = project.members.find(
        member => member.user.toString() === user._id.toString()
      );
      
      const taskInfo = memberTaskCounts.find(
        count => count.userId === user._id.toString()
      );
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: memberInfo.role,
        joinedAt: memberInfo.joinedAt,
        taskCount: taskInfo?.taskCount || 0,
        taskStatus: taskInfo?.taskStatus || { completed: 0, inProgress: 0, todo: 0 }
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        members: membersWithRoles
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update the inviteToProject function to use the new join URL
exports.inviteToProject = async (req, res) => {
  try {
    const { emails, message } = req.body;
    
    if (!emails || emails.length === 0) {
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
    
    // Check if user is the project lead or has permission
    const userMember = project.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (project.lead.toString() !== req.user.id && (!userMember || userMember.role !== 'Lead')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only the project lead can send invitations'
      });
    }
    
    // Get the inviter's name
    const inviter = await User.findById(req.user.id);
    
    // Generate invitation link - use the join URL
    // Make sure to use the proper full URL including protocol
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/projects/join/${project._id}`;
    
    console.log(`Generating invite link: ${inviteLink} for project ${project.name}`);
    
    // Send invitation emails
    const sendEmail = require('../utils/email');
    
    const successfulEmails = [];
    const failedEmails = [];
    
    for (const email of emails) {
      try {
        // Create HTML content for the email
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Project Invitation</h2>
            <p>Hello,</p>
            <p>${inviter.name} has invited you to join the project "${project.name}" on TeamSync.</p>
            <p>${message || ''}</p>
            <p>Click the button below to join:</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 15px 0;">Join Project</a>
            <p>If the button doesn't work, you can copy and paste this link in your browser: ${inviteLink}</p>
            <p>If you don't have an account yet, you'll need to sign up first.</p>
            <p>Thank you,<br>TeamSync Team</p>
          </div>
        `;
        
        await sendEmail({
          email,
          subject: `Invitation to join project: ${project.name}`,
          message: `${inviter.name} has invited you to join the project "${project.name}" on TeamSync. ${message || ''} Join here: ${inviteLink}`,
          html: htmlContent
        });
        
        console.log(`Invitation sent to ${email}`);
        successfulEmails.push(email);
      } catch (emailError) {
        console.error(`Failed to send invitation to ${email}:`, emailError);
        failedEmails.push({
          email,
          error: emailError.message
        });
        // Continue with other emails even if one fails
      }
    }
    
    // Update the project's lastActivity field
    project.lastActivity = Date.now();
    await project.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Invitations sent successfully',
      data: {
        successful: successfulEmails,
        failed: failedEmails
      }
    });
  } catch (err) {
    console.error('Invitation error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send invitations. Please try again.',
      error: err.message
    });
  }
};