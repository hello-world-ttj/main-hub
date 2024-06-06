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
    model : {
      type:String
    },
    type: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
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
    totalUnits: {
      type:Number,
      default:0
    },
    points: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller"
    },
    published:{
      type:Boolean,
      required:true,
      default:false
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("chargePoint", cpSchema);
