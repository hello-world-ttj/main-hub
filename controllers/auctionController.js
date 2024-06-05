const auctionModel = require('../models/auction')
const cpModel = require("../models/cp")

const getAuctionList = async (req, res) => {
    console.log("hello")
    try {
        const auctionList = await auctionModel.find({})
        res.status(200).json(auctionList)
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

const getAuctionListBySellerId = async ( req, res ) => {
    const {sellerId} = req.params;
    try{
        const auctionList = await auctionModel.find({sellerId:sellerId})
        res.status(200).json(auctionList)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAuctionById = async (req, res) => {
    const {auctionId} = req.params
    try {
        const acutionItem = await auctionModel.findOne({auctionCode: auctionId});
        res.status(200).json(acutionItem)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const acceptBid = async (req,res) => {
    const {auctionId, cpoIdentifier} = req.params;
    try{
        const updatedAuctionItem = await auctionModel.findOneAndUpdate({auctionCode:auctionId, 'bidders.cpoIdentifier': cpoIdentifier},
        {$set :{'bidders.$.status': true }},
        {new:true})

        const cp = await cpModel.findOne({identifier: updatedAuctionItem.cpIdentifier})

        cp.cpos = [...cp.cpos, {cpoIdentifier: cpoIdentifier}]
        await cp.save()       

        res.status(200).json("Bid accepted")
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const rejectBid = async (req,res) => {
    const {auctionId, cpoIdentifier} = req.params;
    try{
        await auctionModel.findOneAndUpdate({auctionId:auctionId, 'bidders.cpoIdentifier': cpoIdentifier},
        {$set :{'bidders.$': {status :false} }},
        {new:true})

        res.status(200).json("Bid rejected")
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}






module.exports = {acceptBid, getAuctionListBySellerId, getAuctionList , rejectBid, getAuctionById}