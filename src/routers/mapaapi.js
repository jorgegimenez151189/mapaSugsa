const express = require('express')
const router = express.Router()
const {cacheInit} = require('../middleware/cache')
const mapaApiControllers = require('../controllers/mapaApiControllers')

router.get(
    '/mapaapi',
    cacheInit,
    mapaApiControllers.getJson
)

module.exports = router