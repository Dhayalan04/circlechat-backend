const messageRepository = require('../repositories/messageRepository');

const createMessage = async (messagePayload) => {
  if (!messagePayload || !messagePayload.text) {
    const error = new Error('Message text is required');
    error.status = 400;
    throw error;
  }

  return messageRepository.saveMessage({ text: messagePayload.text });
};

const getAllMessages = async () => {
  return messageRepository.findAllMessages();
};

const getMessage = async (messageId) => {
  const message = await messageRepository.findMessageById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    error.status = 404;
    throw error;
  }
  return message;
};

const removeMessage = async (messageId) => {
  const message = await messageRepository.deleteMessageById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    error.status = 404;
    throw error;
  }
  return message;
};

const addReply = async (messageId, replyPayload) => {
  if (!replyPayload || !replyPayload.text) {
    const error = new Error('Reply text is required');
    error.status = 400;
    throw error;
  }

  const updatedMessage = await messageRepository.addReplyToMessage(messageId, {
    text: replyPayload.text,
  });

  if (!updatedMessage) {
    const error = new Error('Message not found');
    error.status = 404;
    throw error;
  }

  return updatedMessage;
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessage,
  removeMessage,
  addReply,
};
