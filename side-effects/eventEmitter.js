const EventEmitter = require('events')

class ModbusPollingEmitter extends EventEmitter { }
const mbEmitter = new ModbusPollingEmitter()

const emitProceedEvent = evtName =>
  mbEmitter.emit(evtName)

const emitProceedEventDelayed = (evtName, ms) =>
  () => {
    console.time('delay')
    setTimeout(() => {
      console.timeEnd('delay')
      emitProceedEvent(evtName)
    }, ms)
  }

module.exports = {
  mbEmitter,
  emitProceedEvent,
  emitProceedEventDelayed,
}
