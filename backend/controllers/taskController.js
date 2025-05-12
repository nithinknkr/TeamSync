const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

// Get all tasks for a user
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all tasks assigned to the user
    const tasks = await Task.find({ assignedTo: userId })
      .populate('project', 'name')
      .populate('assignedBy', 'name')
      .sort({ dueDate: 1 });
    
    res.status(200).json({
      status: 'success',
      results: tasks.length,
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

// Create a new personal task
exports.createPersonalTask = async (req, res) => {
  try {
    // Check if this is a project task (has project ID in query)
    const projectId = req.query.projectId;
    
    if (projectId) {
      // This is a project task
      // Verify the user is a member of the project with permission to assign tasks
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({
          status: 'fail',
          message: 'Project not found'
        });
      }
      
      // Check if user is a member of the project
      const userMember = project.members.find(
        member => member.user.toString() === req.user.id
      );
      
      if (!userMember) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not a member of this project'
        });
      }
      
      // Only project lead can assign tasks to others
      if (userMember.role !== 'Lead' && req.body.assignedTo !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'Only project leads can assign tasks to other members'
        });
      }
      
      // Create project task
      const taskData = {
        ...req.body,
        isPersonal: false,
        project: projectId,
        assignedBy: req.user.id
      };
      
      const newTask = await Task.create(taskData);
      
      // Update project's lastActivity
      project.lastActivity = Date.now();
      await project.save();
      
      // Populate the assignedTo field for the response
      const populatedTask = await Task.findById(newTask._id)
        .populate('assignedTo', 'name email')
        .populate('project', 'name');
      
      res.status(201).json({
        status: 'success',
        data: {
          task: populatedTask
        }
      });
    } else {
      // This is a personal task
      const taskData = {
        ...req.body,
        isPersonal: true,
        assignedTo: req.user.id,
        assignedBy: req.user.id
      };
      
      const newTask = await Task.create(taskData);
      
      res.status(201).json({
        status: 'success',
        data: {
          task: newTask
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Find the task and check if the user has permission to update it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user is the assignee or the creator of the task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Find the task and check if the user has permission to delete it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user is the assignee or the creator of the task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this task'
      });
    }
    
    await Task.findByIdAndDelete(taskId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add a subtask to a task
exports.addSubtask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Find the task and check if the user has permission to update it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user is the assignee or the creator of the task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Add the subtask
    task.subtasks.push(req.body);
    await task.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a subtask
exports.updateSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    
    // Find the task and check if the user has permission to update it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user is the assignee or the creator of the task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Find the subtask
    const subtask = task.subtasks.id(subtaskId);
    
    if (!subtask) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subtask not found'
      });
    }
    
    // Update the subtask
    Object.keys(req.body).forEach(key => {
      subtask[key] = req.body[key];
    });
    
    await task.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a subtask
exports.deleteSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    
    // Find the task and check if the user has permission to update it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user is the assignee or the creator of the task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Remove the subtask
    task.subtasks.id(subtaskId).remove();
    await task.save();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add this method to your existing taskController.js file

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId)
      .populate('project', 'name')
      .populate('assignedBy', 'name');
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if the user has permission to view this task
    if (task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this task'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};