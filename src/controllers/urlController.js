const axios = require("axios")
var shortId = require("shortid")
const urlModel = require("../models/urlModel")
const { isValid, isValidReqBody } = require('../validations/validator')
const redis = require("redis");
const { promisify } = require("util");





// //============================= connecting to redis =================================================
const redisClient = redis.createClient(
    15497,                // port number 
    "redis-15497.c212.ap-south-1-1.ec2.cloud.redislabs.com",         //endpoint
    { no_ready_check: true }
);

redisClient.auth("a8a7S4xBS4YORJDXv9RzqxqPCD3nWRPR", function (err) {      // authentication of password
    if (err) {
        console.log(err)
    };
});

redisClient.on("connect", async function () {            // port listener
    console.log("Connected to Redis..on port 15497");
});

// //================== connecting setup for redis using get and set method ===============================

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)  //set function of redis
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)  // get function of redis
// const DEL_ASYNC = promisify(redisClient.DEL).bind(redisClient)  // delete function of redis



//========================================= creating short url ==============================================
const createUrl = async (req, res) => {
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
            .then((res) => { if (res.status == 200 || res.status == 201) correctLink = true; })
            .catch((error) => { correctLink = false })

        if (correctLink == false) return res.status(400).send({ status: false, message: "invalid url please enter valid url!!" });

        //========================================== getting data from cache =============================
        const cachedData = await GET_ASYNC(`${longUrl}`)
        // console.log(cachedData)
        // const hello = await DEL_ASYNC(longUrl)
        // console.log(hello)
        if (cachedData) {
            return res.status(200).send({ status: true, message: "Data from Cache", data: JSON.parse(cachedData) })
        }

        //=================================== duplicate longurl ====================================
        const duplicateUrl = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (duplicateUrl) {
            await SET_ASYNC(`${longUrl}`, JSON.stringify(duplicateUrl), `EX`, 60 * 10)
            return res.status(409).send({ status: true, msg: "longUrl already exists in DB", data: duplicateUrl }) //check the status code later
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
        await SET_ASYNC(`${longUrl}`, JSON.stringify(data), `EX`, 60 * 10) // setting data into cache after creating a resource
        return res.status(201).send({ status: true, data: data })

    
    }
    catch (err) {
        res.status(500).send({ error: err.message });
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
        //================================ redirecting using cache ============================================
        let cachedURLCode = await GET_ASYNC(`${urlCode}`)
        if (cachedURLCode) {
            return res.status(302).redirect(cachedURLCode)
        }
        else {
            //============================== if urlcode does not exist ======================================
            const isData = await urlModel.findOne({ urlCode: urlCode });
            if (!isData) {
                return res.status(404).send({ status: false, message: "this urlCode is not present in our database" });
            }

            await SET_ASYNC(`${urlCode}`, (isData.longUrl), `EX`, 60 * 10)
            //========================= redirecting to the longurl =======================================
            return res.status(302).redirect(isData.longUrl) //302 redirect status response
        }

    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
}



module.exports = { createUrl, getUrl }