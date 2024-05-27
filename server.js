const http = require("http");
const WebSocket = require("ws");
const app = require("./app");
const connectDB = require("./db");
const {
  connectExternalWebSocket,
  initializeWebSocketConfigs,
} = require("./services/websocketService");
connectDB();

const httpServer = http.createServer(app);
const websocketServers = new Map();

const websocketPort = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocket.Server({ port: websocketPort });
global.wss = wss; // Make wss globally accessible for broadcasting
wss.on("connection", (ws, req) => {
  const identifier = req.url.split("/").pop();
  ws.identifier = identifier;

  ws.on("message", (message) => {
    const externalWebSocket = websocketServers.get(ws.identifier);
    if (externalWebSocket && externalWebSocket.readyState === WebSocket.OPEN) {
      externalWebSocket.send(message, (error) => {
        if (error) {
          console.error(
            `Error sending message to external WebSocket (${ws.identifier}):`,
            error.message
          );
        }
      });
    } else {
      console.error(
        `No external WebSocket found for identifier: ${ws.identifier}`
      );
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected with identifier: ${ws.identifier}`);
  });

  ws.on("error", (error) => {
    console.error(
      `WebSocket error with client identifier ${ws.identifier}:`,
      error.message
    );
  });
});

app.get("/", (req, res) => {
  res.send("HTTP Server is Running");
});

const httpPort = process.env.HTTP_PORT || 3000;
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server started on port ${httpPort}`);
});

initializeWebSocketConfigs(websocketServers, connectExternalWebSocket);

console.log(`WebSocket Server started on port ${websocketPort}`);
