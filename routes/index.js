const express = require("express");
const {
  getWebSocketConfigs,
  addWebSocketConfigs,
} = require("../controllers/websocketController");
const {
  addChargePoint,
  getAllCps,
  getChargePoint,
} = require("../controllers/chargePointController");

const router = express.Router();

router.route("/configs").get(getWebSocketConfigs).post(addWebSocketConfigs);
router.route("/charge-point").post(addChargePoint).get(getAllCps);
router.get("/charge-point/:id", getChargePoint);
module.exports = router;
