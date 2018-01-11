const io = require('socket.io-client')

const socket = io('http://localhost:3300/', {
  reconnect: true,
})

socket.on('connect', () => {
  console.log('Im socket.io client and I succesfully connected')
  socket.emit('hmi-message', { isTestStarted: true })
  /*setTimeout(
    () =>
      socket.emit('hmi-message', { isTestStarted: false })
    , 3500,
  )*/
})

socket.on('plc-message', console.log)
