require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { initializeWebSocketConfigs } = require("./services/websocketService");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", routes);
app.get("/", (req, res) => {
  res.send("HTTP Server is Running");
});
initializeWebSocketConfigs();

module.exports = app;
