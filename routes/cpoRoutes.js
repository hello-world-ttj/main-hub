const express = require('express')
const {getCpo} = require('../controllers/cpoContoller')


const router = express.Router()


router.get("/:cpoId", getCpo)

module.exports = router