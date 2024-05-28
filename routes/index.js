const express = require("express");
const { getWebSocketConfigs, addWebSocketConfigs } = require("../controllers/websocketController");


const router = express.Router();

router.route("/configs").get(getWebSocketConfigs).post(addWebSocketConfigs);

module.exports = router;
