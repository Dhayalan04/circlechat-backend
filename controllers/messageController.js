const messageService = require('../services/messageService');

const createMessage = async (req, res, next) => {
  try {
    const message = await messageService.createMessage(req.body);
    const broadcast = req.app.locals.broadcastEvent;

    if (typeof broadcast === 'function') {
      broadcast({ type: 'message:created', payload: message });
    }

    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getAllMessages();
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const message = await messageService.getMessage(req.params.id);
    return res.json(message);
  } catch (error) {
    return next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const deletedMessage = await messageService.removeMessage(req.params.id);
    const broadcast = req.app.locals.broadcastEvent;

    if (typeof broadcast === 'function') {
      broadcast({ type: 'message:deleted', payload: { id: req.params.id } });
    }

    return res.json({ deleted: true, message: deletedMessage });
  } catch (error) {
    return next(error);
  }
};

const replyToMessage = async (req, res, next) => {
  try {
    const updatedMessage = await messageService.addReply(req.params.id, req.body);
    const broadcast = req.app.locals.broadcastEvent;

    if (typeof broadcast === 'function') {
      broadcast({ type: 'message:replied', payload: updatedMessage });
    }

    return res.status(201).json(updatedMessage);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  deleteMessage,
  replyToMessage,
};
