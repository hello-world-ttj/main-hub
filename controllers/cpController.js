const cpModel = require('../models/cp')
const auctionModel = require("../models/auction")




const getCps = async (req, res)  => {
    try {
        const cps = await cpModel.find();
        res.status(200).json(cps)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
}
const getCp = async (req, res) => {
    const {cpid} = req.params
    try {
        const cp = await cpModel.findOne({identifier: cpid});
        res.status(200).json(cp)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getCpsBySellerId = async (req, res) => {
    const {sellerId} = req.params;
    try {
        const cps = await cpModel.find({sellerId : sellerId});
        res.status(200).json(cps)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}





const createCp = async (req, res) => {
    const cp = req.body;
    try {
        const createdCp = await cpModel.create(cp)
        res.status(200).json(createdCp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const publishCp = async (req, res) => {
    const {cpId} = req.params;
    const auctionObj = req.body;
    try{
        const cp = await cpModel.findOneAndUpdate({identifier: cpId}, {published:true})
        await auctionModel.create(auctionObj);
        res.status(200).json({"message": "Published!"})    
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}


const unpublishCp = async (req, res) => {
    const {cpId, auctionCode} = req.params;
    
    try{
        const cp = await cpModel.findOneAndUpdate({identifier: cpId}, {published:false})
        await auctionModel.deleteOne({auctionCode:auctionCode});
        res.status(200).json({"message": "Unpublished!"})    
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}




const placeBid =  async (req, res) => {
    const {auctionId} = req.params;
    const bidderObj = req.body;

    try {
        const auctionItem = await auctionModel.findOne({auctionCode:auctionId})
        const bidders = [...auctionItem.bidders, bidderObj]
        console.log(bidders)
        const updatedAuctionItem = await auctionModel.findOneAndUpdate({auctionCode: auctionId}, {bidders: bidders})
        res.status(200).json(updatedAuctionItem)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = {createCp, publishCp, placeBid, getCps, getCpsBySellerId, getCp, unpublishCp}