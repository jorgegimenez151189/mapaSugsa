
require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const dataDistancia = require('../models/Distancia')

const getDistanciaSoap = async (req, res) => {
    try {
        const date = new Date()
        const dia = '2022-05-01T00:00:00'
        const diaHoy = date.toString()
        console.log(diaHoy)
        console.log(date)
        console.log(dia)
        const data = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <RecuperarDistanciaRecorridaPorFechaYVehiculo xmlns="http://sw.smartmovepro.net/">\n      <usuario>TRANSPORTEINTMISIONERO</usuario>\n      <clave>WEBTRANSPORTEINTMISIONERO618</clave>\n      <codigoEntidad>323</codigoEntidad>\n      <codigoEmpresa>618</codigoEmpresa>\n  <fechaDesde>${dia}</fechaDesde>\n <FechaHasta>${dia}</FechaHasta>\n    <identificadorVehiculo>-1</identificadorVehiculo>\n    </RecuperarDistanciaRecorridaPorFechaYVehiculo>\n  </soap:Body>\n</soap:Envelope>`;
        
        const config = {
          method: 'post',
          url: 'http://swweb.smartmovepro.net/modulodistancias/swdistancias.asmx?wsdl',
          headers: { 
            'Content-Type': 'text/xml'
          },
          data : data
        };

        axios(config)
        .then(function (response) {
        
            parseString(response.data, async (err, results) => {
                const dato = results['soap:Envelope']['soap:Body'][0].RecuperarDistanciaRecorridaPorFechaYVehiculoResponse[0].RecuperarDistanciaRecorridaPorFechaYVehiculoResult[0]
                
                parseString(dato, async(err, resultado) => {
                    const respuesta = resultado.DocumentElement.distancia
                    const distancia = []
                    respuesta.map((e) => {
                        distancia.push({
                            IdVehiculo: e.IdVehiculo.toString(),
                            Patente: e.Patente.toString(),
                            NumeroInterno: e.NumeroInterno.toString(),
                            Fecha: e.Fecha.toString(),
                            CodigoEquipo: e.CodigoEquipo.toString(),
                            TotalDistanciasPorDia: e.TotalDistanciasPorDia.toString(),
                            TotalDistanciaPorVehiculo: e.TotalDistanciaPorVehiculo.toString()
                        }) 
                    })
                    const DistanciaPorFechaVehiculo = {
                        DistanciaPorFechaVehiculo: distancia
                    }

                    const dato = new dataDistancia(DistanciaPorFechaVehiculo)
                    await dato.save()
                    res.status(200).json(DistanciaPorFechaVehiculo)
                })
               
            })
        });

    } catch (error) {
        console.log('Error',error.message)
        res
            .status(500)
            .json({ message: 'Internal server error' })
    }
}

const getDistanciaDb = async (req, res) => {

    try {
        const data = await dataDistancia.find()

        //DistanciaTotal
        let totalDistancia = 0
        data[0].DistanciaPorFechaVehiculo.map( e => {
           totalDistancia = parseFloat(e.TotalDistanciasPorDia) + totalDistancia
        })

        //DistaciaTipoka
        let ditanciaTipoka = 0
        const tipoka = data[0].DistanciaPorFechaVehiculo.filter( e => e.IdVehiculo.includes('T') )
        tipoka.map( e => {
            ditanciaTipoka = parseFloat(e.TotalDistanciasPorDia) + ditanciaTipoka
         })

        //DistaciaRosario
        let ditanciaRosario = 0
        const rosario = data[0].DistanciaPorFechaVehiculo.filter( e => e.IdVehiculo.includes('R') )
        rosario.map( e => {
            ditanciaRosario = parseFloat(e.TotalDistanciasPorDia) + ditanciaRosario
         })

        //DistaciaCasimiro
        let ditanciaCamisiro = 0
        const casimiro = data[0].DistanciaPorFechaVehiculo.filter( e => {
            if (!e.IdVehiculo.includes('R') & !e.IdVehiculo.includes('T')) {
                return e.IdVehiculo
            }

        })
        casimiro.map( e => {
            ditanciaCamisiro = parseFloat(e.TotalDistanciasPorDia) + ditanciaCamisiro
         })

        const distanciaObject = {
            TotalDistancia : Math.trunc(totalDistancia),
            Empresas: {
                Tipoka: Math.trunc(ditanciaTipoka),
                Casimiro: Math.trunc(ditanciaCamisiro),
                Rosario: Math.trunc(ditanciaRosario)
            }
        }

        res.status(200).json(distanciaObject)
    } catch (error) {
        res.status(400).json(error)
    }
    
}

module.exports = {
    getDistanciaSoap,
    getDistanciaDb
}





