const mongoose = require("mongoose");

const wsConfigSchema = mongoose.Schema(
  {
    identifier: { type: String, required: true },
    url: { type: String, required: true },
    cpoIdentifier: {type:String, required:true}
  },
  { timestamps: true }
);

module.exports = mongoose.model("wsConfig", wsConfigSchema);
