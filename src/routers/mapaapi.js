const express = require('express')
const router = express.Router()
const {cacheInit} = require('../middleware/cache')
const mapaApiControllers = require('../controllers/mapaApiControllers')

router.get(
    '/mapaapi',
    mapaApiControllers.getJson
)

module.exports = router