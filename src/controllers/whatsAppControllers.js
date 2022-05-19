
require("dotenv").config();
const { whatsappBot } = require('../middleware/whatsapp')

const whatsapp = async (req, res) => {
    const {message, to} = req.body
    
        whatsappBot(message, to)
        
    
}


module.exports = {
    whatsapp,
}





