const WS = require("ws");
const {
  saveAndBroadcast,
  getMessages,
} = require("../controllers/messageController");

class WebSocketService {
  constructor() {
    // store connected clients
    this.clients = new Set();
  }

  // Initialize WebSocket server
  init(server) {
    // Cretae WebSocket server
    this.wss = new WS.Server({ server });

    // handle new connections
    this.wss.on("connection", (ws) => {
      console.log("New client connected");
      this.clients.add(ws);

      // Handle incoming messages
      ws.on("message", async (message) => {
        const content = message.toString();
        await saveAndBroadcast(content);
      });

      // Handle client disconnection
      ws.on("close", () => {
        console.log("client disconnected");
        this.clients.delete(ws);
      });

      // Send message history to new client
      getMessages().then((messages) => {
        ws.send(
          JSON.stringify({
            type: "history",
            messages: messages,
          })
        );
      });
    });
  }

  // Send message to all connected clients
  broadcast(message) {
    this.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(message);
      }
    });
  }
}
