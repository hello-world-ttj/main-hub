const mongoose = require("mongoose");

const WebSocketConfigSchema = mongoose.Schema(
  {
    identifier: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("webSocketConfig", WebSocketConfigSchema);
