const modbus = require('modbus-stream')

const {
  kpMbTCPConnection,
  kpRawData,
  kpDataToWrite,
} = require('../constants/keypaths')

const resolveModbusConnection = mbopts =>
  new Promise((resolve, reject) => {
    modbus.tcp.connect(mbopts.port, mbopts.host, { debug: null }, (err, connection) => {
      if (err) {
        return reject(err)
      }

      return resolve(connection)
    })
  })

const requestModbusRegisters = ioScheme =>
  new Promise((resolve, reject) => {
    const connection = ioScheme.getIn(kpMbTCPConnection)

    connection.readHoldingRegisters({ address: 0, quantity: 8 }, (err, res) => {
      if (err) {
        return reject(err)
      }

      const updatedIOScheme = ioScheme
        .updateIn(kpRawData, () => res.response.data)

      return resolve(updatedIOScheme)
    })
  })

const writeModbusRegisters = ioScheme =>
  new Promise((resolve, reject) => {
    const connection = ioScheme.getIn(kpMbTCPConnection)
    const dataToWrite = ioScheme.getIn(kpDataToWrite)

    connection.writeMultipleRegisters({ address: 0, values: dataToWrite }, (err) => {
      if (err) {
        return reject(err)
      }

      return resolve(ioScheme)
    })
  })

module.exports = {
  resolveModbusConnection,
  requestModbusRegisters,
  writeModbusRegisters,
}
