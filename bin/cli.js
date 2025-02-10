#!/usr/bin/env node

const { program } = require("commander");
const WebSocket = require("ws");

program
  .command("start")
  .description("Start the broadcast server")
  .action(() => {
    require("../src/server");
  });

program
  .command("connect")
  .description("Connect to the broadcast server as a client")
  .action(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.on("open", () => {
      console.log("Connected to the server");
      process.stdin.on("data", (data) => {
        ws.send(data.toString().trim());
      });
    });

    ws.on("message", (message) => {
       try {
         // Try to parse the message as JSON
         const data = JSON.parse(message);
         if (data.type === "history") {
           console.log("Message history:");
           data.data.forEach((msg) => {
             console.log(`${msg.timestamp}: ${msg.content}`);
           });
         }
       } catch (error) {
         // If parsing fails, treat it as a plain text message
         console.log(`Received: ${message}`);
       }
    });

    ws.on("close", () => {
      console.log("Disconnected from the server");
    });
  });

program.parse(process.argv);
