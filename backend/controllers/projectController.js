const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

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