const WebSocket = require("ws");
const { saveOCPPLogs } = require("../controllers/chargePointController");
const wsConfig = require("../models/wsConfig");

const websocketServers = new Map();
let mysockets = [];

const connectExternalWebSocket = (identifier, url) => {
  const externalWebSocket = new WebSocket(url);

  externalWebSocket.on("open", () => {
    console.log(
      `Connected to external WebSocket server with identifier: ${identifier} and URL: ${url}`
    );
    if (!websocketServers.has(identifier)) {
      websocketServers.set(identifier, []);
    }
    websocketServers.get(identifier).push({ url, socket: externalWebSocket });
  });

  externalWebSocket.on("close", () => {
    console.log(
      `Disconnected from external WebSocket server with identifier: ${identifier} and URL: ${url}`
    );
    if (websocketServers.has(identifier)) {
      websocketServers.set(
        identifier,
        websocketServers
          .get(identifier)
          .filter((ws) => ws.socket !== externalWebSocket)
      );
    }
  });

  externalWebSocket.on("error", (error) => {
    console.error(
      `WebSocket error with identifier ${identifier} and URL ${url}:`,
      error.message
    );
  });

  externalWebSocket.on("message", (message) => {
    handleExternalMessage(identifier, url, message);
  });

  return externalWebSocket;
};

const handleExternalMessage = async (identifier, url, message) => {
  const messageParts = JSON.parse(message);
  await saveOCPPLogs(identifier, messageParts[2], messageParts[3], "CMS");

  if (messageParts[2] === "RemoteStartTransaction") {
    mysockets.push({
      details: messageParts[3],
      identifier: identifier,
      url: url,
      socket: websocketServers
        .get(identifier)
        .find((ws) => ws.url === url && ws.socket.readyState === WebSocket.OPEN)
        .socket,
    });
  }

  console.log(
    `Received from external WebSocket server (${identifier}, ${url}): ${message}`
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

const handleClientMessage = async (ws, message) => {
  const messageContent = JSON.parse(message);
  const messageType = messageContent[2];

  await saveOCPPLogs(ws.identifier, messageType, messageContent[3], "CP");

  console.log("🚀 ~ handleClientMessage ~ messageType:", messageType);
  switch (messageType) {
    case "StartTransaction":
      handleStartTransaction(messageContent, ws.identifier);
      break;
    case "MeterValues":
      handleMeterValues(messageContent, ws.identifier);
      break;
    case "StopTransaction":
      handleStopTransaction(messageContent, ws.identifier);
      break;
    default:
      forwardMessageToExternal(ws.identifier, message);
      break;
  }
};

const handleStartTransaction = (messageContent, identifier) => {
  const transactionDetails = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) =>
      socketObj.details.connectorId === transactionDetails.connectorId &&
      socketObj.details.idTag === transactionDetails.idTag &&
      socketObj.identifier === identifier &&
      socketObj.url === transactionDetails.url
  );

  console.log(
    "🚀 ~ handleStartTransaction ~ transactionDetails:",
    transactionDetails
  );
  console.log(
    "🚀 ~ handleStartTransaction ~ activeSocketObj:",
    activeSocketObj
  );

  if (activeSocketObj) {
    activeSocketObj.socket.send(JSON.stringify(messageContent), handleError);
  }
};

const handleMeterValues = (messageContent, identifier) => {
  const meterValue = messageContent[3];
  const activeSocketObj = mysockets.find(
    (socketObj) =>
      socketObj.details.connectorId === meterValue.connectorId &&
      socketObj.identifier === identifier &&
      socketObj.url === meterValue.url
  );

  console.log("🚀 ~ handleMeterValues ~ meterValue:", meterValue);
  console.log("🚀 ~ handleMeterValues ~ activeSocketObj:", activeSocketObj);

  if (activeSocketObj) {
    activeSocketObj.transactionId = meterValue.transactionId;
    activeSocketObj.socket.send(JSON.stringify(messageContent), handleError);
  }
};

const handleStopTransaction = (messageContent, identifier) => {
  const transactionId = messageContent[3].transactionId;
  const activeSocketObj = mysockets.find(
    (socketObj) =>
      socketObj.transactionId === transactionId &&
      socketObj.identifier === identifier &&
      socketObj.url === messageContent[3].url
  );

  console.log("🚀 ~ handleStopTransaction ~ transactionId:", transactionId);
  console.log("🚀 ~ handleStopTransaction ~ activeSocketObj:", activeSocketObj);

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
  externalWebSockets.forEach(({ socket }) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message, handleError);
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
    const configs = await wsConfig.find();
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
