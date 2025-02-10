const { program } = require("commander");
const app = require("../src/app");
const WS = require("ws");
const websocketService = require("../src/services/websocketService");
program
  .command("start")
  .description("Start the broadcast server")
  .option("-p, --port <number>", "Port to run the server on", 5000)
  .command("connect")
  .description("Connect to the broadcast server")
  .option("-p, --port <number>", "Port to connect to", 5000);

program.parse(process.argv);

// handle 'start' command
if (program.args[0] === "start") {
  const port = program.opts().port; // Get the port option
  // start the server
  const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

  // Initialize websocket service
  websocketService.init(server);
}
//    Handle 'connect' command
else if (program.args[0] === "connect") {
  const port = program.opts().port; // Get the port option
  // Create WebSocket connection
  const ws = new WS(`ws://localhost:${port}`);

  // connection opened
  ws.on("open", () => {
    // Allow typing messages from command line
    process.stdin.on("data", (data) => {
      ws.send(data.toString().trim());
    });
  });

  // Recieve messages
  ws.on("message", (data) => {
    console.log(`Recieved: ${data}`);
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Disconnected from server");
    process.exit(0);
  });
}

// // Define CLI commands
// const argv = yargs
//   .command("start", "Start the broadcast server", {
//     port: {
//       description: "Port to run the server on",
//       default: 5000,
//     },
//   })
//   .command("connect", "Connect to the broadcast server", {
//     port: {
//       description: "Port to connect to",
//       default: 5000,
//     },
//   })
//   .help().argv;

// // handle 'start' command
// if (argv._[0] === "start") {
//   // start the server
//   const server = app.listen(argv.port, () => {
//     console.log(`Server started on port ${argv.port}`);
//   });

//   // Initialize websocket service
//   websocketService.init(server);
// }
// //    Handle 'connect' command
// else if (argv._[0] === "connect") {
//   // Create WebSocket connection
//   const ws = new WS(`ws://localhost:${argv.port}`);

//   // connection opened
//   ws.on("open", () => {
//     // Allow typing messages from command line
//     process.stdin.on("data", (data) => {
//       ws.send(data.toString().trim());
//     });
//   });

//   // Recieve messages
//   ws.on("message", (data) => {
//     console.log(`Recieved: ${data}`);
//   });

//   // Handle disconnection
//   ws.on("close", () => {
//     console.log("Disconnected from server");
//     process.exit(0);
//   });
// }
