const express = require("express")
const router = express.Router()
const mapaApi = require("./mapaapi")

router.use("/", mapaApi)

module.exports = router