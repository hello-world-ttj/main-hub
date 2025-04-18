const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

// Create HTTP server for Express app
const httpServer = http.createServer(app);

// Map to store WebSocket servers and their corresponding identifiers
const websocketServers = new Map();

// Function to establish connections to external WebSocket servers dynamically
function connectExternalWebSocket(identifier, url) {
  const externalWebSocket = new WebSocket(url);

  externalWebSocket.on("open", () => {
    console.log(`Connected to external WebSocket server with identifier: ${identifier}`);
    websocketServers.set(identifier, externalWebSocket); // Store WebSocket server with its identifier
  });

  externalWebSocket.on("close", () => {
    console.log(`Disconnected from external WebSocket server with identifier: ${identifier}`);
    websocketServers.delete(identifier); // Remove WebSocket server from map on close
  });

  externalWebSocket.on("error", (error) => {
    console.error(`WebSocket error with identifier ${identifier}:`, error.message);
  });

  externalWebSocket.on("message", (message) => {
    console.log(`Received from external WebSocket server (${identifier}): ${message}`);

    // Broadcast the received message to clients connected with the corresponding identifier
    broadcastMessage(identifier, message);
  });

  return externalWebSocket;
}

// Function to broadcast message to clients based on identifier
function broadcastMessage(identifier, message) {
  const clients = Array.from(wss.clients).filter((client) => client.identifier === identifier);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        const jsonData = JSON.parse(message);
        client.send(JSON.stringify(jsonData));
      } catch (error) {
        console.error(`Error sending message to client (${client.identifier}):`, error.message);
      }
    }
  });
}

// Start the primary WebSocket server on a different port
const websocketPort = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocket.Server({ port: websocketPort });
wss.on("connection", (ws, req) => {
  console.log("Client connected to primary WebSocket server");

  // Extract identifier from the end of the URL path (e.g., '/GOEC001')
  const identifier = req.url.split("/").pop();
  console.log(`Client connected with identifier: ${identifier}`);

  // Store the client's identifier for message filtering
  ws.identifier = identifier;

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log(`Received from client with identifier ${ws.identifier}: ${message}`);

    // Forward the message to the corresponding external WebSocket server
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
      console.error(`No external WebSocket found for identifier: ${ws.identifier}`);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log(
      `Client disconnected from primary WebSocket server with identifier: ${ws.identifier}`
    );
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error with client identifier ${ws.identifier}:`, error.message);
  });
});

// Serve your Express app
app.get("/", (req, res) => {
  res.send("HTTP Server is Running");
});

// Start the HTTP server on a different port
const httpPort = process.env.HTTP_PORT || 3000;
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server started on port ${httpPort}`);
});

// Define WebSocket server configurations
const externalWebSocketConfigs = [
  { identifier: "GOEC001", url: "wss://oxium.goecworld.com:5500/GOEC001" },
  { identifier: "TESTPOWER", url: "ws://goeccms.numocity.com:9033/ocpp/TESTPOWER" },
  { identifier: "P1001", url: "ws://evconnect.telioev.com:80/P1001" },
  { identifier: "TESTPOWERONE", url: "ws://goeccms.numocity.com:9033/ocpp/TESTPOWERONE" },
  { identifier: "EXP", url: "ws://example.com:8000/EXP" },
];

// Establish connections to external WebSocket servers dynamically
externalWebSocketConfigs.forEach((config) => {
  const { identifier, url } = config;
  const externalWebSocket = connectExternalWebSocket(identifier, url);

  // Log errors for each WebSocket connection
  externalWebSocket.on("error", (error) => {
    console.error(`Error with external WebSocket (${identifier}):`, error.message);
  });
});

console.log(`WebSocket Server started on port ${websocketPort}`);
