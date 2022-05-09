
require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;

const getJson = async (req, res) => {
    try {
        
        const data = '<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <RecuperarEstadosActuales xmlns="http://sw.smartmovepro.net/">\n      <usuario>TRANSPORTEINTMISIONERO</usuario>\n      <clave>WEBTRANSPORTEINTMISIONERO618</clave>\n      <codigoEntidad>323</codigoEntidad>\n      <codigoEmpresa>618</codigoEmpresa>\n      <identificadorVehiculo>-1</identificadorVehiculo>\n    </RecuperarEstadosActuales>\n  </soap:Body>\n</soap:Envelope>';

        const config = {
          method: 'post',
          url: 'http://swweb.smartmovepro.net/modulomonitorizacion/swmonitorizacion.asmx?wsdl',
          headers: { 
            'Content-Type': 'text/xml'
          },
          data : data
        };

        axios(config)
        .then(function (response) {
        
            parseString(response.data, (err, results) => {
                const data = results['soap:Envelope']['soap:Body'][0].RecuperarEstadosActualesResponse[0].RecuperarEstadosActualesResult[0].DocumentElement[0]
                console.log(data['estadosActuales'][0].codigoEmpresa[0])
                if (data['estadosActuales'][0].codigoEmpresa[0] === -12) {
                    res.status(400).json({
                        msg: 'Datos vacios'
                    })
                }
                res.status(200).json(data)
            })

        });

        
    } catch (error) {
        console.log('Error',error.message)
        res
            .status(500)
            .json({ message: 'Internal server error' })
    }
}

module.exports = {
    getJson,
}





