const fs = require('fs')
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const {generateImage} = require('../handler/handle');
// const { default: chalk } = require('chalk');

const whatsappBot = (message, to) => {
    console.log(message, to)
    const SESSION_FILE_PATH = './session.json'
    let client
    let sessionData

    const withSession = () => {
        //Si existe cargamos el archivo con las credenciales 
        const spinner = ora(`Cargando ${chalk.yellow('Validando session con Whatsapp...')}`)
        sessionData = require(SESSION_FILE_PATH)
        spinner.start()

        client = new Client({
            session: sessionData
        })

        client.on('ready', () => {
            console.log('Cliente is ready')
            spinner.stop()
        })
    }

    /**
     * Esta funcion GENERA EL QRCODE *
     */

    const withOutSession = (number) => {
        console.log('No tenemos session guardada')
        console.log([
            '🙌 El core de whatsapp se esta actualizando',
            '🙌 para proximamente dar paso al multi-device',
            '🙌 Si estas usando el modo multi-device se generan 2 QR Code escanealos',
            '🙌 Ten paciencia se esta generando el QR CODE',
            '________________________',
        ].join('\n'));

        client = new Client();

        client.on('qr', qr => generateImage(qr, () => {
            qrcode.generate(qr, { small: true });
            socketEvents.sendQR(qr)
        }))

        client.on('ready', (a) => {
            connectionReady()
            listenMessage()
        });

        client.on('authenticated', (session) => {
            sessionData = session;
            if(sessionData){
                fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                    if (err) {
                        console.log(`Ocurrio un error con el archivo: `, err)
                    }
                })
            }
        })

        client.initialize();
    }

    /**
     * Revisamos si existe archivo con credenciales!
     */
    (fs.existsSync(SESSION_FILE_PATH) && MULTI_DEVICE === 'false') ? withSession() : withOutSession();
}

module.exports = {
    whatsappBot,
}


