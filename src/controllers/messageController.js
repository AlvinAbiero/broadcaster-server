const Message = require("../models/Message");
const wsService = require("../services/websocketService");

// Save message and broadcast to all clients
exports.saveAndBroadcast = async (content) => {
  try {
    // create new message
    const message = new Message({ content });

    // save to database
    await message.save();

    // broadcast to all connected clients
    wsService.broadcast(content);

    return message;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

// Retrieve recent messages
exports.getMessages = async () => {
  try {
    // get 100 most recent messages
    return await Message.find().sort({ timestamp: -1 }).limit(100);
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};
