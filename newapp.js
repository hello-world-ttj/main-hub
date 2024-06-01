const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const websocketServers = new Map();
let mysockets = [];

// Function to establish connections to external WebSocket servers dynamically
function connectExternalWebSocket(identifier, url) {
  const externalWebSocket = new WebSocket(url);

  externalWebSocket.on("open", () => {
    console.log(
      `Connected to external WebSocket server with identifier: ${identifier}`
    );
    if (!websocketServers.has(identifier)) {
      websocketServers.set(identifier, []);
    }
    websocketServers.get(identifier).push(externalWebSocket); // Store WebSocket server with its identifier
  });

  externalWebSocket.on("close", () => {
    console.log(
      `Disconnected from external WebSocket server with identifier: ${identifier}`
    );
    if (websocketServers.has(identifier)) {
      websocketServers.set(
        identifier,
        websocketServers
          .get(identifier)
          .filter((ws) => ws !== externalWebSocket)
      );
    }
  });

  externalWebSocket.on("error", (error) => {
    console.error(
      `WebSocket error with identifier ${identifier}:`,
      error.message
    );
  });

  externalWebSocket.on("message", (message) => {
    handleExternalMessage(identifier, message);
  });

  return externalWebSocket;
}

// Function to handle messages from external WebSocket servers
function handleExternalMessage(identifier, message) {
  const bufferData = Buffer.from(message);
  const messageContent = bufferData.toString("utf8");
  const messageParts = JSON.parse(messageContent);

  if (messageParts[2] === "RemoteStartTransaction") {
    mysockets.push({
      details: messageParts[3],
      socket: websocketServers.get(identifier),
    });
  }

  console.log(
    `Received from external WebSocket server (${identifier}): ${message}`
  );
  broadcastMessage(identifier, messageContent);
}

// Function to broadcast message to clients based on identifier
function broadcastMessage(identifier, message) {
  const clients = Array.from(wss.clients).filter(
    (client) => client.identifier === identifier
  );
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        const jsonData = JSON.parse(message);
        client.send(JSON.stringify(jsonData));
      } catch (error) {
        console.error(
          `Error sending message to client (${client.identifier}):`,
          error.message
        );
      }
    }
  });
}

// Function to handle incoming client messages
function handleClientMessage(ws, message) {
  const messageContent = JSON.parse(Buffer.from(message).toString("utf8"));
  const messageType = messageContent[2];

  switch (messageType) {
    case "StartTransaction":
      handleStartTransaction(messageContent);
      break;
    // case "MeterValues":
    //   handleMeterValues(messageContent);
    //   break;
    case "StopTransaction":
      handleStopTransaction(messageContent);
      break;
    default:
      forwardMessageToExternal(ws.identifier, message);
      break;
  }
}

// Handle StartTransaction message
function handleStartTransaction(messageContent) {
  const transactionDetails = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) =>
      socketObj.details.connectorId === transactionDetails.connectorId &&
      socketObj.details.idTag === transactionDetails.idTag
  );

  if (activeSocketObj) {
    activeSocketObj.socket.send(message, handleError);
  }
}

// Handle MeterValues message
function handleMeterValues(messageContent) {
  const meterValue = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) => socketObj.details.connectorId === meterValue.connectorId
  );

  if (activeSocketObj) {
    activeSocketObj.transactionId = meterValue.transactionId;
    activeSocketObj.socket.send(message, handleError);
  }
}

// Handle StopTransaction message
function handleStopTransaction(messageContent) {
  const transactionId = messageContent[3].transactionId;
  const activeSocketObj = mysockets.find(
    (socketObj) => socketObj.transactionId === transactionId
  );

  if (activeSocketObj) {
    activeSocketObj.socket.send(message, handleError);
    mysockets = mysockets.filter(
      (socketObj) => socketObj.transactionId !== transactionId
    );
  }
}

// Forward message to external WebSocket servers
function forwardMessageToExternal(identifier, message) {
  console.log(`Received from client with identifier ${identifier}: ${message}`);
  const externalWebSockets = websocketServers.get(identifier) || [];
  externalWebSockets.forEach((externalWebSocket) => {
    if (externalWebSocket.readyState === WebSocket.OPEN) {
      externalWebSocket.send(message, handleError);
    }
  });
}

// Error handler
function handleError(error) {
  if (error) {
    console.error("Error occurred:", error.message);
  }
}

// Start the primary WebSocket server on a different port
const websocketPort = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocket.Server({ port: websocketPort });

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
  { identifier: "TESTPOWERONE", url: "ws://65.0.248.79:5500/TESTPOWERONE" },
  // {
  //   identifier: "TESTPOWERONE",
  //   url: "ws://goeccms.numocity.com:9033/ocpp/TESTPOWERONE",
  // },
];

// Establish connections to external WebSocket servers dynamically
externalWebSocketConfigs.forEach((config) => {
  const { identifier, url } = config;
  const externalWebSocket = connectExternalWebSocket(identifier, url);

  // Log errors for each WebSocket connection
  externalWebSocket.on("error", (error) => {
    console.error(
      `Error with external WebSocket (${identifier}):`,
      error.message
    );
  });
});

console.log(`WebSocket Server started on port ${websocketPort}`);
