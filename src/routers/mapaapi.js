const express = require('express')
const router = express.Router()
const mapaApiControllers = require('../controllers/mapaApiControllers')

router.get(
    '/mapaapi',
    mapaApiControllers.getJson
)

module.exports = router