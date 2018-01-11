const socketio = require('socket.io')()
const _ = require('lodash')
const most = require('most')

const {
  storeModbusConnection,
  mapRegistersToIOScheme,
  mapIOSchemeToRegisters,
} = require('./logic/registersTranformation')

const {
  resolveModbusConnection,
  passModbusConnection,
  requestModbusRegisters,
  writeModbusRegisters,
} = require('./connection/mbtcp')

const switchLamps = require('./logic/switchLamps')

const ioScheme = require('./scheme/ioscheme')

const EventEmitter = require('events')

class ModbusPollingEmitter extends EventEmitter { }

const mbEmitter = new ModbusPollingEmitter()

const mbopts = {
  port: 502,
  host: 'localhost',
}

const resolveSocketIOInstance = () =>
  new Promise((resolve) => {
    socketio.listen(3300)
    resolve(socketio.sockets)
  })

const storeConnections = scheme =>
  (io, mbtcp) =>
    scheme
      .updateIn(['comms', 'mbtcp'], () => mbtcp)
      .updateIn(['comms', 'socketio'], () => io)

const socketIOsource = most
  .fromEvent('connection', socketio)
  .flatMap(o => most.fromEvent('hmi-message', o))
  .startWith(null)

const injectHMIMessages = (scheme, HMIPaylod) => {
  if (!HMIPaylod) {
    return scheme
  }

  return scheme
    .update('hmi', v => Object.assign({}, v, HMIPaylod))
}

const dedupeHMIMessages = (seed, scheme) => {
  const isHMIMessageDupe = _.isEqual(
    scheme.get('hmi'),
    seed,
  )

  const updatedSeed = isHMIMessageDupe
    ? seed
    : scheme.get('hmi')

  const passedScheme = isHMIMessageDupe
    ? scheme
    : scheme.update('hmi', () => seed)

  return {
    seed: updatedSeed,
    value: passedScheme,
  }
}

const source = most
  .combineArray(
    storeConnections(ioScheme),
    [
      most.fromPromise(resolveSocketIOInstance()),
      most.fromPromise(resolveModbusConnection(mbopts)),
    ],
  )
  .tap(() => mbEmitter.emit('proceed'))
  .combine(passModbusConnection, most.periodic(1))
  .sampleWith(most.fromEvent('proceed', mbEmitter))
  .combine(injectHMIMessages, socketIOsource)
  // .flatMap(o => most.fromPromise(requestModbusRegisters(o)))
  // .map(mapRegistersToIOScheme)
  // .loop(switchLamps, ioScheme)
  // .map(mapIOSchemeToRegisters)
  // .flatMap(o => most.fromPromise(writeModbusRegisters(o)))
  .multicast()

source
  .tap(() => setTimeout(() => mbEmitter.emit('proceed'), 1000))
  .tap(v => console.log(v.get('hmi')))
  .drain()
  .catch(ex => console.error(ex))

source
  .throttle(3000)
  .tap(() => console.log('throtted msg'))
  .drain()
