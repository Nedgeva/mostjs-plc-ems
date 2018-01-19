const socketio = require('socket.io')()

let iter = 0

const generateScheme = () => {
  iter += 1

  const enc1LampsQty = 14
  const enc1ContsQty = 38

  const scheme = {
    enc1: {
      /* lamps */
      lamps: Array(enc1LampsQty).fill(false).map((v, i) => i < iter),
      /* contactors */
      contactors: Array(enc1ContsQty).fill(false),
    },
    enc2: {
      /* lamps */
      lamps: Array(7).fill(false),
      /* contactors */
      contactors: Array(45).fill(false),
    },
    enc4: {
      /* lamps */
      lamps: Array(27).fill(false),
    },
  }

  return scheme
}

socketio.on('connection', (socket) => {
  console.log('client connected')
  socket.on('hmi-message', () => {
    console.log('got message from HMI')
    setInterval(() => socket.emit('plc-message', generateScheme()), 1000)
  })
})

socketio.listen(3300)
