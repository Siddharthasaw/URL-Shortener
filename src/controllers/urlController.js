var validUrl = require('valid-url');
const { isValid, isValidReqBody }= require('../validations/validator')




//========================================= creating short url ==============================================

const createUrl = async function(req,res){
    try{
        let body = req.body
        let {longUrl} = body
        if(!isValidReqBody(body)){
            res.status(400).send({ status: false, message: "Please provide data in request body" })
        }
        if(!longUrl){
            res.status(400).send({ status: false, message: "Please provide longUrl in body" })
        }
        if(!isValid(longUrl)){
            res.status(400).send({ status: false, message: "longUrl must be a string" })
        }
        if (!validUrl.isUri(longUrl)) {
            res.status(400).send({ status: false, message: "Invalid LongURL" })
        }
        const duplicateUrl = await urlModel.findOne({ longUrl: longUrl })
        if(duplicateUrl){
            res.status(409).send({ status: false, message: "Invalid LongURL" })
        }
        

    }
    catch(err){
        res.status(500).send({error:err.message})
    }
}


//===================================== redirecting to the longurl ==========================================

const getUrl = async function (req, res) {
    try {

    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}






module.exports = { createUrl, getUrl }