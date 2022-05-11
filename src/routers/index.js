const express = require("express")
const router = express.Router()
const mapaApi = require("./mapaapi")
const mapaDb = require("./mapadb")

router.use("/", mapaApi)
router.use("/", mapaDb)

module.exports = router