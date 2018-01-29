const {
  kpDataToWrite,
} = require('../constants/keypaths')

const {
  getKPLampsOutputs,
  getKPContactorsOutput,
} = require('../constants/kp-creators')

const boolArrayToBuffer = (arrayOfBools) => {
  const binaryString = arrayOfBools
    .map(v => (v ? 1 : 0))
    .reverse()
    .join('')

  const uint = Number.parseInt(binaryString, 2)
  const uintArray = new Uint16Array(1)
  uintArray[0] = uint
  return Buffer.from(uintArray.buffer)
}

const mapIOSchemeToRegisters = (ioScheme) => {
  const enc1Lamps = ioScheme.getIn(getKPLampsOutputs(1))
  const enc1Contactors = ioScheme.getIn(getKPContactorsOutput(1))
  const enc2Lamps = ioScheme.getIn(getKPLampsOutputs(2))
  const enc2Contactors = ioScheme.getIn(getKPContactorsOutput(2))
  const enc4Lamps = ioScheme.getIn(getKPLampsOutputs(4))
  const enc4Contactors = ioScheme.getIn(getKPContactorsOutput(4))
  const enc11Lamps = ioScheme.getIn(getKPLampsOutputs(11))

  const enc1LampsWord = boolArrayToBuffer(enc1Lamps)
  const enc1ContactorsWord12 = boolArrayToBuffer(enc1Contactors.slice(0, 16))
  const enc1ContactorsWord22 = boolArrayToBuffer(enc1Contactors.slice(16, 32))
  const enc2LampsWord = boolArrayToBuffer(enc2Lamps)
  const enc2ContactorsWord12 = boolArrayToBuffer(enc2Contactors.slice(0, 16))
  const enc2ContactorsWord22 = boolArrayToBuffer(enc2Contactors.slice(16, 32))
  const enc4LampsWord = boolArrayToBuffer(enc4Lamps)
  const enc4ContactorsWord12 = boolArrayToBuffer(enc4Contactors.slice(0, 16))
  const enc4ContactorsWord22 = boolArrayToBuffer(enc4Contactors.slice(16, 20))
  const enc11LampsWord = boolArrayToBuffer(enc11Lamps)

  const dataToWrite = [
    enc1LampsWord,
    enc1ContactorsWord12,
    enc1ContactorsWord22,
    enc2LampsWord,
    enc2ContactorsWord12,
    enc2ContactorsWord22,
    enc4LampsWord,
    enc4ContactorsWord12,
    enc4ContactorsWord22,
    enc11LampsWord,
  ]

  return ioScheme.updateIn(kpDataToWrite, () => dataToWrite)
}

module.exports = mapIOSchemeToRegisters
