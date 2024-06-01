const mongoose = require("mongoose");

const ocppLogsSchema = mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["CP", "CMS"],
      required: true,
    },
    CPID: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      required: true,
    },
    payload: {
      type: Object,
    },
  },
  { timestamps: true }
);

ocppLogsSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

module.exports = mongoose.model("ocppLogs", ocppLogsSchema);
