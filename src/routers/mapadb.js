const express = require('express')
const router = express.Router()
const mapaApiControllers = require('../controllers/mapaApiControllers')

router.get(
    '/mapadb',
    mapaApiControllers.getDB
)

module.exports = router