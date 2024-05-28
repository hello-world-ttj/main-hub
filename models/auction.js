const mongoose = require("mongoose")


const bidSchema = mongoose.Schema({

    cpoIdentifier: {type:String},
    status: {type:Boolean || null}
    // bidAmount  : {type:String},
    // bidPercentage: {type:String},
    // description : {type:String}

})




const auctionSchema = mongoose.Schema({

    auctionCode : { type: String, required: true},
    cpIdentifier: { type: String, required:true},
    sellerId: {type: String, required:true},
    // duration : {type: Number, required:true},
    // startDate: {type:Date, required:true},
    // timePeriod: { type:Number, required:true},
    // type: {type:String, required:true},
    // active : {type: Boolean, required:true},
    bidders : {
        type: [bidSchema]
    }

})


module.exports = mongoose.model('auction', auctionSchema)