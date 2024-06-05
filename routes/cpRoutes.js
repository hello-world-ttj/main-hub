const express = require('express')
const {createCp, publishCp, placeBid, getCps, getCpsBySellerId, getCp, unpublishCp} = require('../controllers/cpController')

const router = express.Router()

router.post('/', createCp )
router.post('/publish/:cpId', publishCp)
router.post('/unpublish/:cpId/:auctionCode', unpublishCp)
router.post('/bid/create/:auctionId', placeBid)
router.get('/list', getCps)
router.get('/:cpid', getCp)
router.get('/:sellerId/list', getCpsBySellerId)

module.exports = router