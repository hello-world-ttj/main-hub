const chargePoint = require("../models/chargePoint");
const ocppLogs = require("../models/ocppLogs");

exports.addChargePoint = async (req, res) => {
  try {
    const getCount = await chargePoint.countDocuments();
    const CPID = "OXIUM0" + (getCount + 1);
    req.body.CPID = CPID;
    const configURL = `ws://13.201.56.220/ws:8080/${CPID}`;
    req.body.configURL = configURL;
    const newCP = await chargePoint.create(req.body);
    if (newCP) {
      res.status(200).json(newCP);
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCps = async (req, res) => {
  try {
    const cps = await chargePoint.find();
    res.status(200).json(cps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChargePoint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "ID not provided" });
    }
    const cp = await chargePoint.findById(id);
    res.status(200).json(cp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveOCPPLogs = async (identity, messageType, payload, source) => {
  try {
    const log = {
      source,
      CPID: identity,
      messageType: messageType.toString(),
      payload,
    };
    await ocppLogs.create(log);
  } catch (error) {
    console.log("🚀 ~ exports.saveOCPPLogs= ~ error:", error)
  }
};
