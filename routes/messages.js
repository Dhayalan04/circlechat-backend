const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.post('/', messageController.createMessage);
router.get('/', messageController.getAllMessages);
router.get('/:id', messageController.getMessageById);
router.delete('/:id', messageController.deleteMessage);
router.post('/:id/replies', messageController.replyToMessage);

module.exports = router;
