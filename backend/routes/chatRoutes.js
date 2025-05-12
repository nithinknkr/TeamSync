const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all chat routes - only authenticated users can access
router.use(authController.protect);

// Team chat routes
router.route('/team')
  .get(chatController.getTeamMessages)
  .post(chatController.sendTeamMessage);

// Personal chat routes
router.route('/personal')
  .get(chatController.getPersonalMessages)
  .post(chatController.sendPersonalMessage);

// For team leads - get list of all personal conversations
router.get('/personal/conversations', chatController.getPersonalConversations);

module.exports = router; 