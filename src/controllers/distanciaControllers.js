
require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;
//Trabajar con los modelos
const dataDistancia = require('../models/Distancia')
const dataMapa = require('../models/Mapa')

const getDistanciaSoap = async (req, res) => {
    try {
        const date = new Date()
        const diaHoy = date.toISOString().split('.')
    
        const data = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <RecuperarDistanciaRecorridaPorFechaYVehiculo xmlns="http://sw.smartmovepro.net/">\n      <usuario>TRANSPORTEINTMISIONERO</usuario>\n      <clave>WEBTRANSPORTEINTMISIONERO618</clave>\n      <codigoEntidad>323</codigoEntidad>\n      <codigoEmpresa>618</codigoEmpresa>\n  <fechaDesde>${diaHoy[0]}</fechaDesde>\n <FechaHasta>${diaHoy[0]}</FechaHasta>\n    <identificadorVehiculo>-1</identificadorVehiculo>\n    </RecuperarDistanciaRecorridaPorFechaYVehiculo>\n  </soap:Body>\n</soap:Envelope>`;
        
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

                    const datosGuardados = await dataDistancia.find()
                    if (datosGuardados.length > 0) {
                        await dataDistancia.deleteMany()
                        const dato = new dataDistancia(DistanciaPorFechaVehiculo)
                        await dato.save()
                        res.status(200).json(DistanciaPorFechaVehiculo)
                    }else{
                        const dato = new dataDistancia(DistanciaPorFechaVehiculo)
                        await dato.save()
                        res.status(200).json(DistanciaPorFechaVehiculo)
                    }
                    
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

        //Coches
        const resultado = await dataMapa.find()
        let totalCoches = 0
        resultado[0].estadosActuales.map( e => {
            for (let i = 1; i < 40; i++) {
                if (e.descripcionServicio.includes(i)) {
                    totalCoches++
                }
            }
        
            for (let j = 90; j < 101; j++) {
                if (e.descripcionServicio.includes(j)) {
                    totalCoches++
                };
            }
        })

        //DistaciaTipoka
        let cochesTipoka = 0
        const cTipoka = resultado[0].estadosActuales.filter( e => e.identificadorVehiculo.includes('T') )
        cTipoka.map( e => {
            cochesTipoka++
         })

        //DistaciaRosario
        let cochesRosario = 0
        const cRosario = resultado[0].estadosActuales.filter( e => e.identificadorVehiculo.includes('R') )
        cRosario.map( e => {
            cochesRosario++
         })

        //DistaciaCasimiro
        let cocheCamisiro = 0
        const cCasimiro = resultado[0].estadosActuales.filter( e => {
            if (!e.identificadorVehiculo.includes('R') & !e.identificadorVehiculo.includes('T')) {
                return e.identificadorVehiculo
            }

        })
        cCasimiro.map( e => {
            cocheCamisiro++
         })


        //Armando el objeto
        const distanciaObject = {
            Coches: {
                TotalCoches: totalCoches,
                Empresa: {
                    Tipoka: cochesTipoka,
                    Casimiro: cocheCamisiro,
                    Rosario: cochesRosario
                }
            },
            Distancias: {
                TotalDistancia : Math.trunc(totalDistancia),
                Empresas: {
                    Tipoka: Math.trunc(ditanciaTipoka),
                    Casimiro: Math.trunc(ditanciaCamisiro),
                    Rosario: Math.trunc(ditanciaRosario)
                }
            }
            
        }
        

        res.status(200).json(distanciaObject)
    } catch (error) {
        res.status(400).json(error)
    }
    
}

module.exports = {
    getDistanciaSoap,
    getDistanciaDb,
}





