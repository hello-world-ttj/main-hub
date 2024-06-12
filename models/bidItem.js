const mongoose = require('mongoose')

const bidItemSchema = mongoose.Schema({
    cpOperator : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"cpOperator"
    },
    auctionObj : {
        type:mongoose.Schema.Types.ObjectId,
        ref: "auctionListItem"
    },
    status: {
        type:String,
    },
    counterAmount:{
        type:Number
    },
    counterPercentage: {
        type: Number
    },
    description: {
        type: String
    },
    makeAdeal: {
        type:Boolean,
        default:false
    },
    makeAdealDuration: {
        type:Number
    }
}, 
{ timestamps: true }
)


module.exports = mongoose.model("bidItem", bidItemSchema)