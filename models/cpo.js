const mongoose = require('mongoose')




const cpoSchema = mongoose.Schema({
    identifier:{type:String},
    assets:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"cp"
        }
    ],
    bids:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"auction"
    }]
})

module.exports = mongoose.model('cpo', cpoSchema)