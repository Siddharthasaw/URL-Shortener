const express = require("express")
const router = express.Router()
const {createUrl,getUrl} = require("../controllers/urlController")


// ----------------------------- CREATE URL --------------------------------------
router.post("/url/shorten", createUrl)

// ----------------------------- GET URL -----------------------------------------
router.get("/:urlCode", getUrl)


module.exports = router