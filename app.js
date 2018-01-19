const most = require('most')

const ioScheme = require('./scheme/ioscheme')
const mapRegistersToIOScheme = require('./transformation/input')
const mapIOSchemeToRegisters = require('./transformation/output')
const switchLamps = require('./logic/switchLamps')
const switchContactors = require('./logic/switchContactors')

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
  host: 'localhost',
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
  .sampleWith(most.fromEvent('proceed', mbEmitter))
  .combine(injectHMIMessages, socketIOsource)
  .flatMap(o => most.fromPromise(requestModbusRegisters(o)))
  .map(mapRegistersToIOScheme)
  .loop(switchLamps, ioScheme)
  .loop(switchContactors, ioScheme)
  .map(mapIOSchemeToRegisters)
  .flatMap(o => most.fromPromise(writeModbusRegisters(o)))
  .multicast()

source
  .tap(emitProceedEventDelayed(250))
  .tap(v => console.log(v.getIn(['outputs', 'discrete'])))
  .drain()
  .catch(ex => console.error(ex))

source
  .throttle(300)
  .tap(pushSocketMessage)
  .drain()
