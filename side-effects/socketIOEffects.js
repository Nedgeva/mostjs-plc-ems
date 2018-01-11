const {
  kpSocketIOConnection,
  kpDiscreteOutputs,
} = require('../constants/keypaths')

const pushSocketMessage = (o) => {
  const emitter = o.getIn(kpSocketIOConnection)
  const outputs = o.getIn(kpDiscreteOutputs)

  emitter.emit('plc-message', outputs)
}

module.exports = pushSocketMessage
