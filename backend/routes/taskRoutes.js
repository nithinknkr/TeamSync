const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
  .get(taskController.getUserTasks)
  .post(taskController.createPersonalTask);

router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

// Subtask routes
router.route('/:id/subtasks')
  .post(taskController.addSubtask);

router.route('/:taskId/subtasks/:subtaskId')
  .patch(taskController.updateSubtask)
  .delete(taskController.deleteSubtask);

module.exports = router;