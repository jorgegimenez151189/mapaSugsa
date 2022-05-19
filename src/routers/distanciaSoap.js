const express = require('express')
const router = express.Router()
const distanciaControllers = require('../controllers/distanciaControllers')

router.get(
    '/distanciaSoap',
    distanciaControllers.getDistanciaSoap
)

module.exports = router