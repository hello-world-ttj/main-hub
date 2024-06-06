const cpOperator = require("../models/cpOperator")

exports.getCpOperatorById = async (req, res) => {
    const {cpoId} = req.params
    try {
        const cpo = await cpOperator.findById(cpoId).populate('assets')
        res.status(200).json(cpo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getCposByCpId = async (req,res) => {
    try {
        const {cpId} = req.params
        const cpos = await cpOperator.find({
            assets : {$in : [cpId]}
        })
        res.status(200).json(cpos)
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}