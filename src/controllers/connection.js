const connectionReady = (cb = () =>{}) => {
    console.log('Listo para escuchas mensajes')
    console.log('Client is ready!');
    console.log('🔴 escribe: hola');
    cb()
}

module.exports = {connectionReady}