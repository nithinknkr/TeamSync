const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
  .get(projectController.getUserProjects)
  .post(projectController.createProject);

// Add these routes for project details
router.route('/:id')
  .get(projectController.getProject);

router.route('/:id/tasks')
  .get(projectController.getProjectTasks)
  .post(projectController.addProjectTask);

// Add this route for project members
router.route('/:id/members')
  .get(projectController.getProjectMembers);

// Add this route for project invitations
router.route('/:id/invite')
  .post(projectController.inviteToProject);

module.exports = router;