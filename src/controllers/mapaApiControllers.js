
require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const dataMapa = require('../models/Mapa')

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
        
            parseString(response.data, async (err, results) => {
                const dato = results['soap:Envelope']['soap:Body'][0].RecuperarEstadosActualesResponse[0].RecuperarEstadosActualesResult[0].DocumentElement[0]
                const mapa = []

                if (dato.estadosActuales.length < 3 && dato.estadosActuales != undefined && dato.estadosActuales != null) {
                    const datosGuardados = await dataMapa.find()
                    res.status(200).json({msg: 'Datos no actualizados'})
                }else if(dato.estadosActuales.length > 2 && dato.estadosActuales != undefined && dato.estadosActuales != null){
                    
                    await dataMapa.deleteMany()
                    dato.estadosActuales.map((e) => {
                        mapa.push({
                                codigoEmpresa: e.codigoEmpresa[0].toString(),  
                                codigoEquipo:  e.codigoEquipo[0],
                                abreviaturaBandera: e.abreviaturaBandera[0], 
                                abreviaturaHorario: e.abreviaturaHorario[0],  
                                abreviaturaLinea: e.abreviaturaLinea[0],
                                abreviaturaPuntoDePasoDesde: e.abreviaturaPuntoDePasoDesde[0], 
                                abreviaturaPuntoDePasoHasta: e.abreviaturaPuntoDePasoHasta[0],  
                                abreviaturaServicio: e.abreviaturaServicio[0],
                                alimentacion: e.alimentacion[0], 
                                cargaBateria: e.cargaBateria[0],  
                                codigoBandera: e.codigoBandera[0],
                                codigoChofer: e.codigoChofer[0], 
                                codigoEstadoActual: e.codigoEstadoActual[0],  
                                codigoEstadoVehiculo: e.codigoEstadoVehiculo[0],
                                codigoHorario: e.codigoHorario[0], 
                                codigoLinea: e.codigoLinea[0],  
                                codigoMediaVueltaTeorica: e.codigoMediaVueltaTeorica[0],
                                codigoModoTrabajoLinea: e.codigoModoTrabajoLinea[0], 
                                codigoPuntoDePasoDesde: e.codigoPuntoDePasoDesde[0],  
                                codigoPuntoDePasoHasta: e.codigoPuntoDePasoHasta[0],
                                codigoServicio: e.codigoServicio[0], 
                                codigoTipoEquipo: e.codigoTipoEquipo[0],  
                                codigoTipoVehiculo: e.codigoTipoVehiculo[0],
                                codigoVehiculo: e.codigoVehiculo[0], 
                                colorBandera: e.colorBandera[0],  
                                descripcionBandera: e.descripcionBandera[0],
                                descripcionEmpresa: e.descripcionEmpresa[0], 
                                descripcionEstadoVehiculo: e.descripcionEstadoVehiculo[0],  
                                descripcionHorario: e.descripcionHorario[0],
                                descripcionLinea: e .descripcionLinea[0], 
                                descripcionModoTrabajoLinea: e.descripcionModoTrabajoLinea[0],  
                                descripcionPuntoDePasoDesde: e.descripcionPuntoDePasoDesde[0],
                                descripcionPuntoDePasoHasta: e.descripcionPuntoDePasoHasta[0], 
                                descripcionServicio: e.descripcionServicio[0],  
                                descripcionTipoEquipo: e.descripcionTipoEquipo[0],
                                descripcionTipoVehiculo: e.descripcionTipoVehiculo[0], 
                                desvioHorario: e.desvioHorario[0],  
                                distanciaAlRecorrido: e.distanciaAlRecorrido[0],
                                fechahoraFinProceso: e.fechahoraFinProceso[0], 
                                fechaHoraGPS: e.fechaHoraGPS[0],  
                                fechaHoraInicioProceso: e.fechaHoraInicioProceso[0],
                                fechaHoraLlegadaMediaVueltaTeorica: e.fechaHoraLlegadaMediaVueltaTeorica[0], 
                                fechaHoraSalidaMediaVueltaTeorica: e.fechaHoraSalidaMediaVueltaTeorica[0],  
                                fechaHoraUTC: e.fechaHoraUTC[0],
                                identificadorChofer: e.identificadorChofer[0], 
                                identificadorVehiculo: e.identificadorVehiculo[0],  
                                latitud: e.latitud[0],
                                longitud: e.longitud[0],
                                modeIndicator: e.modeIndicator[0],  
                                odometro: e.odometro[0],
                                patente: e.patente[0], 
                                sentido: e.sentido[0],  
                                velocidad: e.velocidad[0],
                                apellidoChofer: e.apellidoChofer[0] , 
                                nombreChofer: e.nombreChofer[0],  
                                legajoChofer: e.legajoChofer[0],
                                colorEstadoVehiculo: e.colorEstadoVehiculo[0], 
                                isPrioridadVehiculo: e.isPrioridadVehiculo[0],  
                                porcentajeAvance: e.porcentajeAvance[0],
                                fechaHoraProximoPuntoDePaso: e.fechaHoraProximoPuntoDePaso[0], 
                                codigoPuntoDePasoDesdeProgramado: e.codigoPuntoDePasoDesdeProgramado[0],  
                                codigoPuntoDePasoHastaProgramado: e.codigoPuntoDePasoHastaProgramado[0],
                                abreviaturaPuntoDePasoDesdeProgramado: e.abreviaturaPuntoDePasoDesdeProgramado[0], 
                                abreviaturaPuntoDePasoHastaProgramado: e.abreviaturaPuntoDePasoHastaProgramado[0],  
                                descripcionPuntoDePasoDesdeProgramado: e.descripcionPuntoDePasoDesdeProgramado[0],
                                descripcionPuntoDePasoHastaProgramado: e.codigoEquipo[0], 
                                porcentajeAvanceProgramado: e.porcentajeAvanceProgramado[0],  
                        })
                    })
    
                    const estadosActuales = {
                        estadosActuales: mapa
                    }
                    
                    const dataMap = new dataMapa(estadosActuales)
                    await dataMap.save()

                    const mapaDB = await dataMapa.find()
                
                    res.status(200).json({msg: 'Datos actualizados'})
                }
            })
        });

    } catch (error) {
        console.log('Error',error.message)
        res
            .status(500)
            .json({ message: 'Internal server error' })
    }
}

const getDB = async (req, res) => {
    try {
        const data = await dataMapa.find()
        res.status(200).json(data[0].estadosActuales)
    } catch (error) {
        res.status(400).json(error)
    }
    
    
}

module.exports = {
    getJson,
    getDB,
}





