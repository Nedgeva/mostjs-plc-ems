const {
  kpSocketIOConnection,
  kpDiscreteOutputs,
  kpStorage,
} = require('../constants/keypaths')

const pushSocketMessage = (o) => {
  const emitter = o.getIn(kpSocketIOConnection)
  const outputs = o.getIn(kpDiscreteOutputs)
  const storage = o.getIn(kpStorage)

  emitter.emit('plc-message', Object.assign(
    {},
    outputs,
    { storage },
  ))
}

module.exports = pushSocketMessage
