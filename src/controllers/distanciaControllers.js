
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


        //Base de datos Mapas
        const resultado = await dataMapa.find()

        //EnHorario-Atrasado-Adelantado
        let enHorario = 0
        let atrasado = 0
        let adelantado = 0

        resultado[0].estadosActuales.map( e => {
            if (e.descripcionServicio.length > 0) {
                if (e.descripcionEstadoVehiculo.includes('EN HORARIO')) {
                    enHorario++
                }else if (e.descripcionEstadoVehiculo.includes('ADELANTADO')) {
                    adelantado++
                }else if (e.descripcionEstadoVehiculo.includes('ATRASADO')) {
                    atrasado++
                }
            }
        })

        //Coches
        let totalCoches = 0
        resultado[0].estadosActuales.map( e => {
            if(e.descripcionServicio.length>0){
                if (e.descripcionServicio.length === 1) {
                    for (let i = 1; i < 10; i++) {
                        if (e.descripcionServicio.includes(i)) {
                            if(e.identificadorVehiculo.length === 5){
                                totalCoches++
                            }
                        }
                    }
                }else{
                    for (let i = 10; i < 40; i++) {
                        if (e.descripcionServicio.includes(i)) {
                            if(e.identificadorVehiculo.length === 5){
                                totalCoches++
                            }
                        }
                    }
                    for (let j = 90; j < 101; j++) {
                        if (e.descripcionServicio.includes(j)) {
                            if(e.identificadorVehiculo.length === 5){
                                totalCoches++
                            }
                        };
                    }
                }  
            }
        
            
        })

        //CantidadCochesTipoka
        let cochesTipoka = 0
        let horarioTipoka = 0
        let adelantadoTipoka = 0
        let atrasadoTipoka = 0

        const cTipoka = resultado[0].estadosActuales.filter( e => e.identificadorVehiculo.includes('T') )
        cTipoka.map( e => {

            if (e.descripcionServicio.length > 0) {
                if (e.descripcionEstadoVehiculo.includes('EN HORARIO')) {
                    horarioTipoka++
                }else if (e.descripcionEstadoVehiculo.includes('ADELANTADO')) {
                    adelantadoTipoka++
                }else if (e.descripcionEstadoVehiculo.includes('ATRASADO')) {
                    atrasadoTipoka++
                }
            }

            if (e.descripcionServicio.length === 1) {
                for (let i = 1; i < 10; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesTipoka++
                        }
                    }
                }
            }else{
                for (let i = 10; i < 40; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesTipoka++
                        }
                    }
                }
                for (let j = 90; j < 101; j++) {
                    if (e.descripcionServicio.includes(j)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesTipoka++
                        }
                    };
                }
            }
           
         })

        //CantidadCochesRosario
        let cochesRosario = 0
        let horarioRosario = 0
        let adelantadoRosario = 0
        let atrasadoRosario = 0
        const cRosario = resultado[0].estadosActuales.filter( e => e.identificadorVehiculo.includes('R') )
        cRosario.map( e => {

            if (e.descripcionServicio.length > 0) {
                if (e.descripcionEstadoVehiculo.includes('EN HORARIO')) {
                    horarioRosario++
                }else if (e.descripcionEstadoVehiculo.includes('ADELANTADO')) {
                    adelantadoRosario++
                }else if (e.descripcionEstadoVehiculo.includes('ATRASADO')) {
                    atrasadoRosario++
                }
            }

            if (e.descripcionServicio.length === 1) {
                for (let i = 1; i < 10; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesRosario++
                        }
                    }
                }
            }else{
                for (let i = 10; i < 40; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesRosario++
                        }
                    }
                }
                for (let j = 90; j < 101; j++) {
                    if (e.descripcionServicio.includes(j)) {
                        if(e.identificadorVehiculo.length === 5){
                            cochesRosario++
                        }
                    };
                }
            }
            
         })

        //CantidadCochesCasimiro
        let cocheCamisiro = 0
        let horarioCamisiro = 0
        let adelantadoCamisiro = 0
        let atrasadoCamisiro = 0
        const cCasimiro = resultado[0].estadosActuales.filter( e => {
            if (!e.identificadorVehiculo.includes('R') & !e.identificadorVehiculo.includes('T')) {
                return e.identificadorVehiculo
            }

        })
        cCasimiro.map( e => {

            if (e.descripcionServicio.length > 0) {
                if (e.descripcionEstadoVehiculo.includes('EN HORARIO')) {
                    horarioCamisiro++
                }else if (e.descripcionEstadoVehiculo.includes('ADELANTADO')) {
                    adelantadoCamisiro++
                }else if (e.descripcionEstadoVehiculo.includes('ATRASADO')) {
                    atrasadoCamisiro++
                }
            }

            if (e.descripcionServicio.length === 1) {
                for (let i = 1; i < 10; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cocheCamisiro++
                        }
                    }
                }
            }else{
                for (let i = 10; i < 40; i++) {
                    if (e.descripcionServicio.includes(i)) {
                        if(e.identificadorVehiculo.length === 5){
                            cocheCamisiro++
                        }
                    }
                }
                for (let j = 90; j < 101; j++) {
                    if (e.descripcionServicio.includes(j)) {
                        if(e.identificadorVehiculo.length === 5){
                            cocheCamisiro++
                        }
                    };
                }
            }
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
            },
            Estado: {
                EnHorarios: {
                    EnHorario: enHorario,
                    Empresas:{
                        Tipoka: horarioTipoka,
                        Casimiro: horarioCamisiro,
                        Rosario: horarioRosario
                    },
                },
                Atrasados: {
                    Atrasado: atrasado,
                    Empresas:{
                        Tipoka: atrasadoTipoka,
                        Casimiro: atrasadoCamisiro,
                        Rosario: atrasadoRosario
                    },
                },
                Adelantados: {
                    Adelantado: adelantado,
                    Empresas:{
                        Tipoka: adelantadoTipoka,
                        Casimiro: adelantadoCamisiro,
                        Rosario: adelantadoRosario
                    },
                },
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





