const getKPLampTestEnded = encIndex =>
  [
    'storage',
    'complete',
    `enc${encIndex}LampsEnded`,
  ]

const getKPLampsOutputs = encIndex =>
  [
    'outputs',
    'discrete',
    `enc${encIndex}`,
    'lamps',
  ]

const getKPLampsCompleted = encIndex =>
  [
    'storage',
    'complete',
    `enc${encIndex}Lamps`,
  ]

const getKPLampsBlinked = encIndex =>
  [
    'storage',
    'complete',
    `enc${encIndex}LampsBlinked`,
  ]

const getKPContactorTestEnded = encIndex =>
  [
    'storage',
    'complete',
    `enc${encIndex}ContactorsEnded`,
  ]

const getKPContactorsPassed = encIndex =>
  [
    'storage',
    'complete',
    `enc${encIndex}Contactors`,
  ]

const getKPContactorsOutput = encIndex =>
  [
    'outputs',
    'discrete',
    `enc${encIndex}`,
    'contactors',
  ]

module.exports = {
  getKPLampTestEnded,
  getKPLampsOutputs,
  getKPLampsCompleted,
  getKPLampsBlinked,
  getKPContactorTestEnded,
  getKPContactorsPassed,
  getKPContactorsOutput,
}
