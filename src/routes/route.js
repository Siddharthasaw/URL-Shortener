const express = require("express")
const router = express.Router()
const { createUrl, getUrl } = require("../controllers/urlController")


// ============================= create short url =============================================
router.post("/url/shorten", createUrl)

//======================================= get redirected url =================================
router.get("/:urlCode", getUrl)


//===================================== if invalid endpoint/route =========================
router.all("/**", (req, res) => { res.status(404).send({ status: 'Error', message: "The Path you are requesting is not available !!" }); })

module.exports = router