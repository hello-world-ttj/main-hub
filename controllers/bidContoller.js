const bidItem = require('../models/bidItem')
const auctionList = require("../models/auctionListItem")
const cpOperator = require('../models/cpOperator')
exports.getBidDetailsById = async (req, res) => {
    const {bidId} = req.params;
    try {
        const bid =await  bidItem.findById(bidId).populate({path:"auctionObj" ,populate:{path:"chargePoint"}})
        res.status(200).json(bid)
        
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

exports.getBidsByCpoId = async (req, res) => {
    const {cpoId} = req.params;
    try {
        const bid = await bidItem.find({cpOperator : cpoId}).populate({path:"auctionObj",populate:{path:"chargePoint"}});
        res.status(200).json(bid)
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}


exports.removeBidder = async (req, res) => {
    const {bidId} = req.params
    try {

        const bid = await bidItem.findByIdAndUpdate(bidId, {status : "rejected"})
        // console.log(bid.auctionObj)
        // const deletedBidId = await auctionList.findByIdAndUpdate(
        //     bid.auctionObj,
        //     { $pull: { bids:  bidId } }
        //   );

        //   console.log(deletedBidId)
        res.status(200).json(bid);

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}


exports.makeADeal =  async  (req, res) => {
    const {bidId, days} = req.params;
    try {
        const bid = await bidItem.findByIdAndUpdate(bidId, {status:"Deal Accepted",makeAdeal:true, makeAdealDuration: days})
        res.status(200).json(bid)
    } catch (error) {
        res.status(500).json({ error: error.message });
 
    }
}

exports.confirmDeal = async (req, res) => {
    const {bidId} = req.params;
    try {
        const bid = await bidItem.findByIdAndUpdate(bidId, {status:"Confirmed",makeAdeal:false, makeAdealDuration: 0}).populate({path:"auctionObj", populate: {path: "chargePoint"}})
        console.log(bid.auctionObj.chargePoint.CPID)
        const cpo = await cpOperator.findByIdAndUpdate(bid.cpOperator, { $push : {assets: bid.auctionObj.chargePoint._id} })
        res.status(200).json(cpo)
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}