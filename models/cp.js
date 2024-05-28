const mongoose = require('mongoose')


const cpoSchema =  mongoose.Schema({
    cpoIdentifier:{ type:String}
})


const CPSchema = mongoose.Schema({

    identifier : { type:String, required:true },
    published : {type:Boolean, required:true},
    cpos : { type: [cpoSchema] }


    // url : { type:String, required:true },
    // location : {type:String, required:true},
    // OEM : {type:String, required:true},
    // model : {type:String, required:true},
    // type: {type: String, required: true},
    // serialNo : {type: String, required:true},
    // commissionedOn : {type:Date, required:true},
    // currentRate : {type:Number},
    // statistics : {
    //     points: { type:Number },
    //     noOfCharging : {type:Number},
    // }
    

})

module.exports = mongoose.model("CP", CPSchema);