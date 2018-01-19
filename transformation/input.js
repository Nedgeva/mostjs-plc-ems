const {
  kpRawData,
} = require('../constants/keypaths')

const {
  getKPLampsOutputs,
  getKPContactorsOutput,
} = require('../constants/kp-creators')

const regToBoolArray = registerBuf =>
  registerBuf
    .readUInt16LE()
    .toString(2)
    .padStart(16, '0')
    .split('')
    .reverse()
    .map(v => Number.parseInt(v, 10) > 0)

const mapRegistersToIOScheme = (ioScheme) => {
  const registers = ioScheme.getIn(kpRawData)

  const enc1Lamps = regToBoolArray(registers[0])
    .slice(0, 14)

  const enc1Contactors = regToBoolArray(registers[1])
    .slice(0, 5)

  const enc2Lamps = regToBoolArray(registers[2])
    .slice(0, 8)

  const enc2Contactors = regToBoolArray(registers[3])
    .slice(0, 11)

  return ioScheme
    .updateIn(getKPLampsOutputs(1), () => enc1Lamps)
    .updateIn(getKPContactorsOutput(1), () => enc1Contactors)
    .updateIn(getKPLampsOutputs(2), () => enc2Lamps)
    .updateIn(getKPContactorsOutput(2), () => enc2Contactors)
}

module.exports = mapRegistersToIOScheme
