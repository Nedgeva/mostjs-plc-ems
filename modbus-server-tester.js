const modbus = require('modbus-stream')

modbus.tcp.server({ debug: 'server' }, (connection) => {
  connection.on('read-holding-registers', (req, reply) => {
    console.log(req)

    const uintArray = new Uint16Array(1)
    uintArray[0] = 1

    const uintArray2 = new Uint16Array(1)
    uintArray2[0] = 2

    reply(null, [Buffer.from(uintArray.buffer), Buffer.from(uintArray2.buffer)])
  })
}).listen(502)
