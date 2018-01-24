const most = require('most')
const socketio = require('socket.io')()

const resolveSocketIOInstance = () =>
  new Promise((resolve) => {
    socketio.listen(3300)
    resolve(socketio.sockets)
  })

const socketIOsource = most
  .fromEvent('connection', socketio)
  .flatMap(o => most.fromEvent('hmi-message', o))
  .startWith(null)

const destroySockets = () =>
  socketio.close()

module.exports = {
  resolveSocketIOInstance,
  socketIOsource,
  destroySockets,
}
