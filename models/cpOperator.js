const mongoose = require('mongoose')

const cpOperatorSchema = mongoose.Schema({
    identifier:{type:String},
    assets: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chargePoint"
    }]
})

module.exports = mongoose.model("cpOperator", cpOperatorSchema)