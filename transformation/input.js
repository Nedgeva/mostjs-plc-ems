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

  /* enc 1 mappings */
  const enc1Lamps = regToBoolArray(registers[0])
    .slice(0, 14)

  const enc1Contactors12 = regToBoolArray(registers[1])
    .slice(0, 16)

  const enc1Contactors22 = regToBoolArray(registers[2])
    .slice(0, 16)

  const enc1Contactors = enc1Contactors12.concat(enc1Contactors22)

  /* enc 2 mappings */
  const enc2Lamps = regToBoolArray(registers[3])
    .slice(0, 8)

  const enc2Contactors12 = regToBoolArray(registers[4])
    .slice(0, 16)

  const enc2Contactors22 = regToBoolArray(registers[5])
    .slice(0, 16)

  const enc2Contactors = enc2Contactors12.concat(enc2Contactors22)

  /* enc 4 mappings */
  const enc4Lamps = regToBoolArray(registers[6])
    .slice(0, 7)

  const enc4Contactors12 = regToBoolArray(registers[7])
    .slice(0, 16)

  const enc4Contactors22 = regToBoolArray(registers[8])
    .slice(0, 4)

  const enc4Contactors = enc4Contactors12.concat(enc4Contactors22)

  /* enc 11 mappings */
  const enc11Lamps = regToBoolArray(registers[9])
    .slice(0, 9)

  return ioScheme
    .updateIn(getKPLampsOutputs(1), () => enc1Lamps)
    .updateIn(getKPContactorsOutput(1), () => enc1Contactors)
    .updateIn(getKPLampsOutputs(2), () => enc2Lamps)
    .updateIn(getKPContactorsOutput(2), () => enc2Contactors)
    .updateIn(getKPLampsOutputs(4), () => enc4Lamps)
    .updateIn(getKPContactorsOutput(4), () => enc4Contactors)
    .updateIn(getKPLampsOutputs(11), () => enc11Lamps)
}

module.exports = mapRegistersToIOScheme
