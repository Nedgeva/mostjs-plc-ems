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

  const enc1LampsWord = boolArrayToBuffer(enc1Lamps)
  const enc1ContactorsWord = boolArrayToBuffer(enc1Contactors)
  const enc2LampsWord = boolArrayToBuffer(enc2Lamps)
  const enc2ContactorsWord = boolArrayToBuffer(enc2Contactors)

  const dataToWrite = [
    enc1LampsWord,
    enc1ContactorsWord,
    enc2LampsWord,
    enc2ContactorsWord,
  ]

  return ioScheme.updateIn(kpDataToWrite, () => dataToWrite)
}

module.exports = mapIOSchemeToRegisters
