const express = require('express')
const router = express.Router()
const mapaApiControllers = require('../controllers/mapaApiControllers')

router.get(
    '/mapadb',
    mapaApiControllers.getDB
)

router.get(
    '/mapadb/filtro',
    mapaApiControllers.filter
)

module.exports = router