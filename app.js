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
  destroySockets,
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

let samplerEventCount = 0

const app = (evtName) => {
  const source = most
    .combineArray(
      storeConnections(ioScheme),
      [
        most.fromPromise(resolveSocketIOInstance()),
        most.fromPromise(resolveModbusConnection(mbopts)),
      ],
    )
    .tap(() => emitProceedEvent(evtName))
    .combine(passIOScheme, most.periodic(1))
    .combine(injectHMIMessages, socketIOsource)
    .sampleWith(most.fromEvent(evtName, mbEmitter))
    .flatMap(o => most.fromPromise(requestModbusRegisters(o)))
    .map(mapRegistersToIOScheme)
    .loop(switchLamps, ioScheme)
    .loop(switchContactors, ioScheme)
    .loop(resetOutputs, ioScheme)
    .map(mapIOSchemeToRegisters)
    .flatMap(o => most.fromPromise(writeModbusRegisters(o)))
    .tap(emitProceedEventDelayed(evtName, 100))
    .throttle(500)
    .tap(pushSocketMessage)

  source
    .observe(() => {})
    .catch((ex) => {
      // console.error(ex)
      destroySockets()
      samplerEventCount += 1
      setTimeout(app, 2000, String(samplerEventCount))
    })

  return source
}

app(String(samplerEventCount))
