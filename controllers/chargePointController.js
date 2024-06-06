const chargePoint = require("../models/chargePoint");
const ocppLogs = require("../models/ocppLogs");
const sellers = require('../models/seller')
const auctionList = require("../models/auctionListItem")


exports.addChargePoint = async (req, res) => {
  try {
    const { CPID } = req.body;
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
    const { CPID } = req.params;
    if (!CPID) {
      res.status(400).json({ error: "CPID not provided" });
    }
    const cp = await chargePoint.findOne({CPID});
    res.status(200).json(cp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChargePointsBySellerId = async (req, res) => {
  try {
    const {sellerId} = req.params;
    if (!sellerId) {
      res.status(400).json({ error: "CPID not provided" });
    }
    const cps = await chargePoint.find({sellerId});
    res.status(200).json(cps)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports. publishChargingPoint = async (req, res) => {
  try{
    const {cpId} = req.params;
    console.log(cpId)
    const auctionObj = req.body;
    const cp = await chargePoint.findOneAndUpdate({_id: cpId}, {published:true})
    console.log(cp)
    await auctionList.create(auctionObj);
    res.status(200).json({"message": "Published!"})    
  }
  catch(error){
    res.status(500).json({ error: error.message });
  }
}

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
    console.log("🚀 ~ exports.saveOCPPLogs= ~ error:", error);
  }
};

exports.getOcppLogs = async (req, res) => {
  try {
    const { CPID } = req.query;
    const filter = {};
    if (CPID) {
      filter.CPID = CPID;
    }
    const logs = await ocppLogs.find(filter);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
