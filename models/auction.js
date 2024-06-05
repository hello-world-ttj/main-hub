const mongoose = require("mongoose")


const bidSchema = mongoose.Schema({

    cpo: {type:mongoose.Schema.Types.ObjectId, ref:"cpo"},
    status: {type:Boolean || null},
    bidAmount  : {type:String},
    bidPercentage: {type:String},
    description : {type:String}

})

const typeOfAgreementSchema = mongoose.Schema({
    type:{type:String},
    value:{type:String}
})



const auctionSchema = mongoose.Schema({

    auctionCode : { type: String, required: true},
    cpIdentifier: { type: String, required:true},
    sellerId: {type: String, required:true},
    durationType:{type:String},
    duration : {type: Number, required:true},
    startDate: {type:Date, required:true},
    typeOfAgreement: {
        type:[typeOfAgreementSchema]
    },
    // type: {type:String, required:true},
    // active : {type: Boolean, required:true},
    bidders : {
        type: [bidSchema]
    }

})


module.exports = mongoose.model('auction', auctionSchema)