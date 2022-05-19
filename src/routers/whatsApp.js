const express = require('express')
const router = express.Router()
const whatsAppControllers = require('../controllers/whatsAppControllers')

router.post(
    '/whatsappsusa',
    whatsAppControllers.whatsapp
)


module.exports = router