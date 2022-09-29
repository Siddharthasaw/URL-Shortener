const axios = require("axios")
var shortId = require("shortid")
const urlModel = require("../models/urlModel")
const { isValid, isValidReqBody } = require('../validations/validator')






//========================================= creating short url ==============================================


const createUrl = async function (req, res) {
    try {
        let body = req.body
        let { longUrl } = body
        //====================================== if body is empty ==============================
        if (!isValidReqBody(body)) {
            return res.status(400).send({ status: false, message: "Please provide data in request body" })
        }
        //================================= if longurl is not present in body =========================
        if (!longUrl) {
            return res.status(400).send({ status: false, message: "Please provide longUrl in body" })
        }
        //============================ invalid format of longurl ===================================
        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "longUrl format is not valid" })
        }
        //============================== if longurl is not correct link ==========================
        let correctLink = false
        await axios.get(longUrl)
            .then((res) => {
                if (res.status == 200 || res.status == 201) {
                    correctLink = true;
                }
            })
            .catch((error) => { correctLink = false })

        if (correctLink == false) {
            return res.status(400).send({ status: false, message: "Provide correct longurl!!" })
        };

        //=================================== duplicate longurl ====================================
        const duplicateUrl = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (duplicateUrl) {
            return res.status(409).send({ status: true, data: duplicateUrl }) //check the status code later
        }

        //=============================== generating a urlcode and shorturl =================================
        const urlCode = shortId.generate()
        const shortUrl = `http://localhost:3000/${urlCode}`

        //=========================== adding urlcode & shorturl keys in body ===============================
        body.urlCode = urlCode
        body.shortUrl = shortUrl
        //============================== creating data ===========================================
        const createData = await urlModel.create(body)

        let data = {
            longUrl: createData.longUrl,
            shortUrl: createData.shortUrl,
            urlCode: createData.urlCode

        }
        return res.status(201).send({ status: true, data: data })


    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}




//===================================== redirecting to the longurl ==========================================

const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode;
        //================================ invalid urlcode =======================================
        if (!shortId.isValid(urlCode)) {
            return res.status(400).send({ status: false, message: `Invalid urlCode: ${urlCode} provided` })
        }
        //============================== if urlcode does not exist ======================================
        const isData = await urlModel.findOne({ urlCode });
        if (!isData) {
            return res.status(404).send({ status: false, message: "this urlCode is not present in our database" });
        }
        //========================= redirecting to the longurl =======================================
        return res.status(302).redirect(isData.longUrl) //302 redirect status response


    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}






module.exports = { createUrl, getUrl }