#!/usr/bin/env node

const { program } = require("commander");
const WebSocket = require("ws");
const axios = require("axios");

program
  .command("start")
  .description("Start the broadcast server")
  .action(() => {
    require("../src/server");
  });

program
  .command("register <username> <password>")
  .description("Register a new user")
  .action(async (username, password) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        username,
        password,
      });
      console.log(response.data.message);
    } catch (error) {
      console.error(
        "Error registering user:",
        error.response?.data?.message || error.message
      );
    }
  });

program
  .command("login <username> <password>")
  .description("Login and get a JWT")
  .action(async (username, password) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });
      console.log("Login successful. Token:", response.data.token);
    } catch (error) {
      console.error(
        "Error logging in:",
        error.response?.data?.message || error.message
      );
    }
  });

program
  .command("connect <token>")
  .description("Connect to the broadcast server as a client")
  .action((token) => {
    const ws = new WebSocket(`ws://localhost:5000?token=${token}`);

    ws.on("open", () => {
      console.log("Connected to the server");
      process.stdin.on("data", (data) => {
        ws.send(data.toString().trim());
      });
    });

    ws.on("message", (message) => {
      // try {
      //   // Try to parse the message as JSON
      //   const data = JSON.parse(message);
      //   if (data.type === "history") {
      //     console.log("Message history:");
      //     data.data.forEach((msg) => {
      //       console.log(`${msg.timestamp}: ${msg.content}`);
      //     });
      //   }
      // } catch (error) {
      //   // If parsing fails, treat it as a plain text message
      //   console.log(`Received: ${message}`);
      // }
      console.log(`Received: ${message}`);
    });

    ws.on("close", () => {
      console.log("Disconnected from the server");
    });
  });

program.parse(process.argv);
