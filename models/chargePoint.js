const mongoose = require("mongoose");

const cpSchema = mongoose.Schema(
  {
    CPID: {
      type: String,
      required: true,
    },
    configURL: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    OEM: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["AC", "DC"],
    },
    serialNumber: {
      type: String,
      required: true,
    },
    ocppVersion: {
      type: String,
      default: "1.6",
    },
    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "OFFLINE",
    },
    connectionStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    totalCharging: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chargePoint", cpSchema);
