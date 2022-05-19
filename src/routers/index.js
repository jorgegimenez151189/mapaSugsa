const express = require("express")
const router = express.Router()
const mapaApi = require("./mapaapi")
const mapaDb = require("./mapadb")
const distanciaSoap = require("./distanciaSoap")
const distaciaDb = require("./distanciaDb")

router.use("/", mapaApi)
router.use("/", mapaDb)
router.use("/", distanciaSoap)
router.use("/", distaciaDb)

module.exports = router