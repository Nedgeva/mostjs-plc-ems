const most = require('most')

const ioScheme = require('./scheme/ioscheme')
const mapRegistersToIOScheme = require('./transformation/input')
const mapIOSchemeToRegisters = require('./transformation/output')
const switchLamps = require('./logic/switchLamps')
const switchContactors = require('./logic/switchContactors')
const resetOutputs = require('./logic/resetOutputs')

const {
  storeConnections,
  passIOScheme,
  injectHMIMessages,
} = require('./transformation/combiners')

const {
  resolveSocketIOInstance,
  socketIOsource,
} = require('./connection/socketio')

const {
  resolveModbusConnection,
  requestModbusRegisters,
  writeModbusRegisters,
} = require('./connection/mbtcp')

const {
  mbEmitter,
  emitProceedEvent,
  emitProceedEventDelayed,
} = require('./side-effects/eventEmitter')

const pushSocketMessage = require('./side-effects/socketIOEffects')

const mbopts = {
  port: 502,
  host: 'localhost', // '10.1.132.195',
}

const source = most
  .combineArray(
    storeConnections(ioScheme),
    [
      most.fromPromise(resolveSocketIOInstance()),
      most.fromPromise(resolveModbusConnection(mbopts)),
    ],
  )
  .tap(emitProceedEvent)
  .combine(passIOScheme, most.periodic(1))
  .combine(injectHMIMessages, socketIOsource)
  .sampleWith(most.fromEvent('proceed', mbEmitter))
  .flatMap(o => most.fromPromise(requestModbusRegisters(o)))
  .map(mapRegistersToIOScheme)
  .loop(switchLamps, ioScheme)
  .loop(switchContactors, ioScheme)
  .loop(resetOutputs, ioScheme)
  .map(mapIOSchemeToRegisters)
  .flatMap(o => most.fromPromise(writeModbusRegisters(o)))
  // .multicast()

source
  .tap(emitProceedEventDelayed(100))
  // .tap(v => console.dir(v.getIn(['outputs', 'discrete', 'enc2', 'contactors'])))
  // .tap(v => console.dir(v.getIn(['storage'])))
  .throttle(500)
  .tap(pushSocketMessage)
  .drain()
  .catch(ex => console.error(ex))

/* source
  .throttle(500)
  .tap(pushSocketMessage)
  .drain() */
