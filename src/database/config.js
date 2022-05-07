const mongoose = require("mongoose");

const dbConnection = async() => {

    mongoose.connect(process.env.DB_CNN, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, res) => {
        if (!err) {
            console.log('**** CONEXION CORRECTA ****')
        }else {
            console.log('**** ERROR DE CONEXION ****')
        }
    })

}

module.exports = {
    dbConnection
}
