const express = require('express')
require("dotenv").config();
const cors = require('cors')
const ApiRoutes = require('./routers')
const app = express()
const {dbConnection} = require('./database/config')

//Cors
app.use(cors())

//Lectura y parseo del body
app.use( express.json() )

//Base de datos
dbConnection()

//Ruta
app.use('/api', ApiRoutes)

//Escuchar peticiones

app.get('/', (req, res) => {
    res.status(200).json({message: "Ir a la ruta /api"})
})

//Ruta Base
app.get('/api', (req, res) => {
    res.status(200).json({message: "Json Mapa SUGSA"})
})


module.exports = app;