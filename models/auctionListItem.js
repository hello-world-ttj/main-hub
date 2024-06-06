const mongoose =require('mongoose')

const auctionListItemSchema = mongoose.Schema({
    auctionCode: {
        type:String,
        required:true
    },
    seller: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"seller"
    },
    chargePoint: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"chargePoint"
    },
    duration: {
        type:Number,
        required: true
    },
    timePeriod: {
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    typeOfAgreement : {
        fixedAmount : {
            type:Number       
        },
        profitShare : {          
            type:Number
        }
    },
    bids: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"bidItem"
    }],
    completed: {
        type:Boolean,
        required:true,
        default:false
    }
})


module.exports = mongoose.model('auctionListItem', auctionListItemSchema)