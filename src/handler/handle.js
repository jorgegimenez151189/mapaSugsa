const qr = require('qr-image')
const fs = require('fs')

const generateImage = (cb = () => {}) => {
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
    cb()
}

module.exports = {generateImage}