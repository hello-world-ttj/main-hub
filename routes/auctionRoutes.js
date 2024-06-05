const express = require('express')
const { acceptBid, getAuctionListBySellerId, getAuctionList, rejectBid, getAuctionById } = require('../controllers/auctionController')

const router = express.Router()
router.get('/list/all', getAuctionList)

router.get('/:auctionId', getAuctionById)
router.get('/list/:sellerId', getAuctionListBySellerId)
router.get('/bid/accept/:auctionId/:cpoIdentifier', acceptBid)
router.get('/bid/reject/:auctionId/:cpoIdentifier', acceptBid)


module.exports = router