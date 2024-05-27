const WebSocket = require("ws");
const websocketConfig = require("../models/websocketConfig");

const websocketServers = new Map();

const connectExternalWebSocket = (identifier, url) => {
  const externalWebSocket = new WebSocket(url+identifier);

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
    broadcastMessage(identifier, message);
  });

  return externalWebSocket;
};

const broadcastMessage = (identifier, message) => {
  const clients = Array.from(global.wss.clients).filter((client) => client.identifier === identifier);
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
};

const initializeWebSocketConfigs = async (websocketServers, connectExternalWebSocket) => {
  try {
    const configs = await websocketConfig.find();
    configs.forEach((config) => {
      const { identifier, url } = config;
      const externalWebSocket = connectExternalWebSocket(identifier, url);
      websocketServers.set(identifier, externalWebSocket);
    });
  } catch (error) {
    console.error(`Error initializing WebSocket configs: ${error.message}`);
  }
};

module.exports = {
  connectExternalWebSocket,
  initializeWebSocketConfigs,
  websocketServers,
};
