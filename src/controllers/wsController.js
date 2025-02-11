const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

exports.handleConnection = (ws, req) => {
  const token = req.url.split("token=")[1]; // Extract token from query string

  if (!token) {
    ws.close(4001, "Unauthorized: No token provided");
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    ws.close(4001, "Unauthorized: Invalid token");
    return;
  }

  console.log(`User ${payload.userId} connected`);
  ws.userId = payload.userId; // Attach userid to the WebSocket connection

  ws.on("message", async (message) => {
    console.log(`Received from user ${ws.userId} : ${message}`);

    // save the message to mongoDB
    const newMessage = new Message({ content: message, userId: ws.userId });
    await newMessage.save();

    // Broadcast the message to all connected clients
    ws.server.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(`${ws.userId}: ${message}`);
      }
    });
  });

  ws.on("close", () => {
    console.log(`User ${ws.userId} disconnected`);
  });
};
