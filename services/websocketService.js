const WebSocket = require("ws");
const WebSocketConfig = require("../models/WebSocketConfig");
const { saveOCPPLogs } = require("../controllers/chargePointController");

const websocketServers = new Map();
let mysockets = [];

const connectExternalWebSocket = (identifier, url) => {
  const externalWebSocket = new WebSocket(url);

  externalWebSocket.on("open", () => {
    console.log(
      `Connected to external WebSocket server with identifier: ${identifier}`
    );
    if (!websocketServers.has(identifier)) {
      websocketServers.set(identifier, []);
    }
    websocketServers.get(identifier).push(externalWebSocket);
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
};

const handleExternalMessage = async(identifier, message) => {
  const messageParts = JSON.parse(message);
  await saveOCPPLogs(identifier, messageParts[2], messageParts[3], "CMS");
  if (messageParts[2] === "RemoteStartTransaction") {
    mysockets.push({
      details: messageParts[3],
      socket: websocketServers.get(identifier),
    });
  }

  console.log(
    `Received from external WebSocket server (${identifier}): ${message}`
  );
  broadcastMessage(identifier, message);
};

const broadcastMessage = (identifier, message) => {
  const clients = Array.from(global.wss.clients).filter(
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
};

const handleClientMessage = async(ws, message) => {
  const messageContent = JSON.parse(message);
  const messageType = messageContent[2];

  await saveOCPPLogs(ws.identifier, messageType, messageContent[3], "CP");

  switch (messageType) {
    case "StartTransaction":
      handleStartTransaction(messageContent);
      break;
    case "MeterValues":
      handleMeterValues(messageContent);
      break;
    case "StopTransaction":
      handleStopTransaction(messageContent);
      break;
    default:
      forwardMessageToExternal(ws.identifier, message);
      break;
  }
};

const handleStartTransaction = (messageContent) => {
  const transactionDetails = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) =>
      socketObj.details.connectorId === transactionDetails.connectorId &&
      socketObj.details.idTag === transactionDetails.idTag
  );

  if (activeSocketObj) {
    activeSocketObj.socket.send(JSON.stringify(messageContent), handleError);
  }
};

const handleMeterValues = (messageContent) => {
  const meterValue = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) => socketObj.details.connectorId === meterValue.connectorId
  );

  if (activeSocketObj) {
    activeSocketObj.transactionId = meterValue.transactionId;
    activeSocketObj.socket.send(JSON.stringify(messageContent), handleError);
  }
};

const handleStopTransaction = (messageContent) => {
  const transactionId = messageContent[3].transactionId;
  const activeSocketObj = mysockets.find(
    (socketObj) => socketObj.transactionId === transactionId
  );

  if (activeSocketObj) {
    activeSocketObj.socket.send(JSON.stringify(messageContent), handleError);
    mysockets = mysockets.filter(
      (socketObj) => socketObj.transactionId !== transactionId
    );
  }
};

const forwardMessageToExternal = (identifier, message) => {
  console.log(`Received from client with identifier ${identifier}: ${message}`);
  const externalWebSockets = websocketServers.get(identifier) || [];
  externalWebSockets.forEach((externalWebSocket) => {
    if (externalWebSocket.readyState === WebSocket.OPEN) {
      const jsonData = JSON.parse(message);
      externalWebSocket.send(JSON.stringify(jsonData), handleError);
    }
  });
};

const handleError = (error) => {
  if (error) {
    console.error("Error occurred:", error.message);
  }
};

const initializeWebSocketConfigs = async () => {
  try {
    const configs = await WebSocketConfig.find();
    configs.forEach((config) => {
      const { identifier, url } = config;
      connectExternalWebSocket(identifier, url);
    });
  } catch (error) {
    console.error(`Error initializing WebSocket configs: ${error.message}`);
  }
};

module.exports = {
  connectExternalWebSocket,
  initializeWebSocketConfigs,
  websocketServers,
  mysockets,
  handleClientMessage,
};
