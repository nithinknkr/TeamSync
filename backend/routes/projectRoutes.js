const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public project route (doesn't require authentication)
router.get('/:id/public', authController.isLoggedIn, projectController.getPublicProjectInfo);

// Protect all routes after this middleware
router.use(authController.protect);

// Routes that don't require a specific project ID
router.route('/')
  .get(projectController.getUserProjects)
  .post(projectController.createProject);

// Protected project routes
router.route('/:id')
  .get(projectController.getProject);

router.route('/:id/tasks')
  .get(projectController.getProjectTasks)
  .post(projectController.addProjectTask);

router.route('/:id/members')
  .get(projectController.getProjectMembers);

// Add this route for project invitations
router.route('/:id/invite')
  .post(projectController.inviteToProject);

// Add this route for joining a project
router.route('/:id/join')
  .post(projectController.joinProject);

module.exports = router;