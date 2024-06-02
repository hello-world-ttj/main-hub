const express = require("express");
const {
  getWebSocketConfigs,
  createWebSocketConfig,
} = require("../controllers/websocketController");
const {
  addChargePoint,
  getAllCps,
  getChargePoint,
  getOcppLogs,
} = require("../controllers/chargePointController");

const router = express.Router();

router.route("/configs").get(getWebSocketConfigs).post(createWebSocketConfig);
router.route("/charge-point").post(addChargePoint).get(getAllCps);
router.get("/charge-point/:CPID", getChargePoint);
router.get("/ocpp-logs", getOcppLogs);
module.exports = router;
