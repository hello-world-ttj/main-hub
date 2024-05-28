const express = require('express')
const { acceptBid, getAuctionListBySellerId, getAuctionList, rejectBid } = require('../controllers/auctionController')

const router = express.Router()


router.get('/list/:sellerId', getAuctionListBySellerId)
router.get('/list', getAuctionList)
router.get('/bid/accept/:auctionId/:cpoIdentifier', acceptBid)
router.get('/bid/reject/:auctionId/:cpoIdentifier', acceptBid)


module.exports = router