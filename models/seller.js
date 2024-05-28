const mongoose = require('mongoose')


const sellerSchema = mongoose.Schema({

    sellerName : {type: String}
})


module.exports = mongoose.model('seller', sellerSchema)