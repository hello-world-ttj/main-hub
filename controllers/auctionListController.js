const auctionList = require('../models/auctionListItem')
const bid = require("../models/bidItem")
const cpOperator = require("../models/cpOperator")
const cp = require('../models/chargePoint')

exports.getAuctionList = async (req, res) => {
  try{
        const list = await auctionList.find({completed : false}).populate({path:"seller"}).populate({path:"chargePoint"}).populate({path:"bids",populate:{path:"cpOperator"}})
        res.status(200).json(list)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getAuctionListItemsBySellerId = async (req, res) => {
    const {sellerId} = req.params;
    try{
        const list = await auctionList.find({seller:sellerId}).populate("seller chargePoint")
        res.status(200).json(list)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getAuctionById = async (req,res) => {
    const {auctionId} = req.params;
    try {
        const auctionObj = await auctionList.findById(auctionId).populate({path:"seller"}).populate({path:"chargePoint"}).populate({path:"bids",populate:{path:"cpOperator auctionObj"}})
        console.log(auctionObj)

        res.status(200).json(auctionObj)
        
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

exports.closeAuction = async (req, res) => {
    const {auctionId} = req.params;
    try{
        const auctionItem = await auctionList.findByIdAndUpdate(auctionId, {completed:true})
        res.status(200).json(auctionItem)

    }
    catch(error){
        res.status(500).json({ error: error.message });

    }
}

exports.placeBid = async (req, res) => {
    
    try {
        const cpoId = req.body.cpOperator;
        const cpObj = await cpOperator.findOne({identifier: cpoId})
        req.body.cpOperator = cpObj._id;
        const bidObj = await bid.create(req.body);
        const auctionObj = await auctionList.findByIdAndUpdate(req.body.auctionObj, {$push :{bids : bidObj._id}} )
        res.status(200).json(auctionObj)
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

exports.endAuction = async (req, res) => {
    try {
        const {auctionId} = req.params
        console.log(auctionId)
        const auctionObj = await auctionList.findByIdAndUpdate(auctionId, {completed:true})
        const cpObj = await cp.findByIdAndUpdate(auctionObj.chargePoint, {published:false})
        console.log(cpObj)
        res.status(200).json(auctionObj)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}