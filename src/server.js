const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const dotenv = require("dotenv");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// connect to MongoDB
connectDB();

// Store connected clients
const clients = new Set();

wss.on("connection", async (ws) => {
  console.log("New client connected");
  clients.add(ws);

  // Fetch and send message history to the new client
  const messages = await Message.find().sort({ timestamp: 1 }).limit(50);

  ws.send(JSON.stringify({ type: "history", data: messages }));

  ws.on("message", async (message) => {
    console.log(`Recieved: ${message}`);

    // Save the message to MongoDB
    const newMessage = new Message({ content: message });
    await newMessage.save();

    // Broadcast the message to all connected clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
