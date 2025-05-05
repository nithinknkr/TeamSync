const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
  .get(projectController.getUserProjects)
  .post(projectController.createProject);

router.route('/:id/tasks')
  .post(projectController.addProjectTask);

module.exports = router;