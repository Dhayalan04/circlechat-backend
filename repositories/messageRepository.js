const Message = require('../models/message');

const saveMessage = async (messageData) => {
  const message = new Message(messageData);
  return message.save();
};

const findAllMessages = async () => {
  return Message.find().sort({ createdAt: 1 }).lean();
};

const findMessageById = async (id) => {
  return Message.findById(id).lean();
};

const deleteMessageById = async (id) => {
  return Message.findByIdAndDelete(id);
};

const addReplyToMessage = async (messageId, replyData) => {
  return Message.findByIdAndUpdate(
    messageId,
    { $push: { replies: replyData } },
    { new: true, runValidators: true }
  ).lean();
};

module.exports = {
  saveMessage,
  findAllMessages,
  findMessageById,
  deleteMessageById,
  addReplyToMessage,
};
