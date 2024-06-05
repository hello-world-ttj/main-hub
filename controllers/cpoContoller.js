const cpo = require('../models/cpo')


const getCpo = async (req,res)=> {
    const {cpoId} = req.params
    console.log(cpoId)
    try {
        const cpoObj = await cpo.findOne({identifier:cpoId})
        res.status(200).json(cpoObj)
    } catch (error) {
       res.status(500).json(error) 
    }
}


module.exports = {getCpo}