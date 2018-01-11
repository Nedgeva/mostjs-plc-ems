const EventEmitter = require('events')

class ModbusPollingEmitter extends EventEmitter { }
const mbEmitter = new ModbusPollingEmitter()

const emitProceedEvent = () =>
  mbEmitter.emit('proceed')

const emitProceedEventDelayed = ms =>
  () => setTimeout(emitProceedEvent, ms)

module.exports = {
  mbEmitter,
  emitProceedEvent,
  emitProceedEventDelayed,
}
