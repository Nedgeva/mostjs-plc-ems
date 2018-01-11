const {
  kpHMI,
  kpMbTCPConnection,
  kpSocketIOConnection,
} = require('../constants/keypaths')

const storeConnections = scheme =>
  (io, mbtcp) =>
    scheme
      .updateIn(kpMbTCPConnection, () => mbtcp)
      .updateIn(kpSocketIOConnection, () => io)

const passIOScheme = IOScheme =>
  IOScheme

const injectHMIMessages = (scheme, HMIPayload) => {
  if (!HMIPayload) {
    return scheme
  }

  return scheme
    .updateIn(kpHMI, v => Object.assign({}, v, HMIPayload))
}

module.exports = {
  storeConnections,
  passIOScheme,
  injectHMIMessages,
}
