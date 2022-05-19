const express = require('express')
const router = express.Router()
const distanciaControllers = require('../controllers/distanciaControllers')

router.get(
    '/distanciadb',
    distanciaControllers.getDistanciaDb
)

module.exports = router