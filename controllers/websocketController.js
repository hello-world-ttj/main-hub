const wsConfig = require("../models/wsConfig");
const { connectExternalWebSocket } = require("../services/websocketService");

exports.getWebSocketConfigs = async (req, res) => {
  try {
    const configs = await wsConfig.find();
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createWebSocketConfig = async (req, res) => {
  try {
    const { identifier, url } = req.body;
    const newConfig = await wsConfig.create(req.body);
    await newConfig.save();

    connectExternalWebSocket(identifier, url);

    res.status(201).json(newConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getWSconfigByCpoIdandCpId = async (req, res) => {
  try {
    const {cpoId, cpId} = req.params
    const wsConfigObj = await wsConfig.find({identifier:cpId, cpoIdentifier:cpoId})

    res.status(200).json(wsConfigObj)
    
  } catch (error) {
    res.status(500).json({ message: error.message });
    
  }
}