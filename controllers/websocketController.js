const websocketConfig = require("../models/websocketConfig");
const {
  connectExternalWebSocket,
  websocketServers,
} = require("../services/websocketService");

exports.getWebSocketConfigs = async (req, res) => {
  try {
    const configs = await websocketConfig.find();
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addWebSocketConfigs = async (req, res) => {
  try {
    const { identifier, url } = req.body;
    const newHub = await websocketConfig.create(req.body);
    if (newHub) {
      res.status(201).json(newHub);
      const externalWebSocket = connectExternalWebSocket(identifier, url);
      websocketServers.set(identifier, externalWebSocket);
    } else {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
