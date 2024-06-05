const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const cpRoutes = require("./routes/cpRoutes")
const auctionRoutes = require("./routes/auctionRoutes")
const cpoRoutes = require('./routes/cpoRoutes')

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", routes);
app.use("/cp", cpRoutes)
app.use("/auction", auctionRoutes)
app.use("/api/cpo", cpoRoutes)

module.exports = app;
