const http = require("http");
const WebSocket = require("ws");
const app = require("./app");
const connectDB = require("./db");
const { handleClientMessage } = require("./services/websocketService");
connectDB();

const httpServer = http.createServer(app);
const websocketPort = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocket.Server({ port: websocketPort });

global.wss = wss;

wss.on("connection", (ws, req) => {
  console.log("Client connected to primary WebSocket server");

  const identifier = req.url.split("/").pop();
  console.log(`Client connected with identifier: ${identifier}`);
  ws.identifier = identifier;

  ws.on("message", (message) => {
    handleClientMessage(ws, message);
  });

  ws.on("close", () => {
    console.log(
      `Client disconnected from primary WebSocket server with identifier: ${ws.identifier}`
    );
  });

  ws.on("error", (error) => {
    console.error(
      `WebSocket error with client identifier ${ws.identifier}:`,
      error.message
    );
  });
});


const httpPort = process.env.HTTP_PORT || 3000;
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server started on port ${httpPort}`);
});

console.log(`WebSocket Server started on port ${websocketPort}`);
