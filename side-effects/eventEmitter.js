const EventEmitter = require('events')

class ModbusPollingEmitter extends EventEmitter { }
const mbEmitter = new ModbusPollingEmitter()

const emitProceedEvent = () =>
  mbEmitter.emit('proceed')

const emitProceedEventDelayed = ms =>
  () => {
    console.time('delay')
    setTimeout(() => {
      console.timeEnd('delay')
      emitProceedEvent()
    }, ms)
  }

module.exports = {
  mbEmitter,
  emitProceedEvent,
  emitProceedEventDelayed,
}
