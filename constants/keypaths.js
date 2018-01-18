const kpHMI = ['hmi']
const kpDiscreteOutputs = ['outputs', 'discrete']
const kpMbTCPConnection = ['comms', 'mbtcp']
const kpSocketIOConnection = ['comms', 'socketio']
const kpRawData = ['rawData']
const kpDataToWrite = ['dataToWrite']
const kpDelays = ['delays']
const kpLampIgnitionTimestamp = ['delays', 'lampIgnitedAt']
const kpLampCompletionTimestamp = ['delays', 'lampCompletedAt']
const kpBeforeNextLampDelay = ['delays', 'beforeNextLamp']
const kpBeforeLampTurnOffDelay = ['delays', 'beforeLampTurnOff']
const kpStorage = ['storage']
const kpAllLampsCompleted = ['storage', 'allLampsCompleted']
const kpIsTestRunning = ['storage', 'isTestRunning']
const kpIsTestStarted = ['hmi', 'isTestStarted']
const kpLampTestCompleted = ['storage', 'allLampsCompleted']
const kpAllContactorsCompleted = ['storage', 'allContactorsCompleted']
const kpBeforeContactorTurnoffDelay = ['delays', 'beforeContactorTurnoff']
const kpBeforeNextContactorDelay = ['delays', 'beforeNextContactor']
const kpContactorEnabledTimestamp = ['delays', 'contactorEnabledAt']
const kpContactorDisabledTimestamp = ['delays', 'contactorDisabledAt']
const kpContactorEnabled = ['storage', 'contactorEnabled']
const kpLampsEncs = ['storage', 'lampsEncs']
const kpContactorsEncs = ['storage', 'contactorsEncs']

module.exports = {
  kpHMI,
  kpDiscreteOutputs,
  kpMbTCPConnection,
  kpSocketIOConnection,
  kpRawData,
  kpDataToWrite,
  kpDelays,
  kpLampIgnitionTimestamp,
  kpLampCompletionTimestamp,
  kpBeforeNextLampDelay,
  kpBeforeLampTurnOffDelay,
  kpStorage,
  kpAllLampsCompleted,
  kpIsTestRunning,
  kpIsTestStarted,
  kpLampTestCompleted,
  kpAllContactorsCompleted,
  kpBeforeContactorTurnoffDelay,
  kpBeforeNextContactorDelay,
  kpContactorEnabledTimestamp,
  kpContactorDisabledTimestamp,
  kpContactorEnabled,
  kpLampsEncs,
  kpContactorsEncs,
}
