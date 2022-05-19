const {Schema, model} = require("mongoose");

const DistanciaSchema = new Schema({
    DistanciaPorFechaVehiculo: [{
        IdVehiculo: { type: String},
        Patente: { type: String},
        NumeroInterno: { type: String},
        Fecha: { type: String},
        CodigoEquipo: { type: String},
        TotalDistanciasPorDia: { type: String},
        TotalDistanciaPorVehiculo: { type: String}
    }]
}, {
    timestamps: true,
    versionKey: false
})

module.exports = model('Distancia', DistanciaSchema)