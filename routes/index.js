const express = require("express");
const {
  getWebSocketConfigs,
  createWebSocketConfig,
} = require("../controllers/websocketController");
const {
  addChargePoint,
  getAllCps,
  getChargePoint,
} = require("../controllers/chargePointController");

const router = express.Router();

router.route("/configs").get(getWebSocketConfigs).post(createWebSocketConfig);
router.route("/charge-point").post(addChargePoint).get(getAllCps);
router.get("/charge-point/:id", getChargePoint);
module.exports = router;
