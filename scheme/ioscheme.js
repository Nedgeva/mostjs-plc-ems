const immutable = require('immutable')

const IOBlueprintFactory = immutable.Record({
  /* physical signals */
  outputs: {
    discrete: {
      enc1: {
        /* lamps */
        lamps: Array(14).fill(false),
        /* contactors */
        contactors: Array(32).fill(false),
      },
      enc2: {
        /* lamps */
        lamps: Array(8).fill(false),
        /* contactors */
        contactors: Array(32).fill(false),
      },
      enc4: {
        /* lamps */
        lamps: Array(7).fill(false),
        /* contactors */
        contactors: Array(20).fill(false),
      },
    },
  },
  /* store communication there */
  comms: {
    mbtcp: null,
    socketio: null,
  },
  /* buffer array */
  rawData: null,
  /* data to write */
  dataToWrite: null,
  /* timers */
  delays: {
    lampIgnitedAt: 0,
    lampCompletedAt: 0,
    beforeNextLamp: 1000,
    beforeLampTurnOff: 3000,
    contactorEnabledAt: 0,
    contactorDisabledAt: 0,
    beforeContactorTurnoff: 2000,
    beforeNextContactor: 1000,
  },
  /* commands from hmi */
  hmi: {
    isTestStarted: false,
    isCancelled: false,
  },
  /* internal storage for algos */
  storage: {
    lampsEncs: [1, 2, 4],
    contactorsEncs: [1, 2, 4],
    isTestRunning: false,
    allLampsCompleted: false,
    allContactorsCompleted: false,
    contactorEnabled: false,
    complete: {
      enc1Lamps: 0,
      enc1LampsBlinked: false,
      enc1LampsEnded: false,
      enc1Contactors: 0,
      enc1ContactorsEnded: false,
      enc2Lamps: 0,
      enc2LampsBlinked: false,
      enc2LampsEnded: false,
      enc2Contactors: 0,
      enc2ContactorsEnded: false,
      enc4Lamps: 0,
      enc4LampsBlinked: false,
      enc4LampsEnded: false,
      enc4Contactors: 0,
      enc4ContactorsEnded: false,
    },
  },
})

const ioBlueprint = new IOBlueprintFactory()

module.exports = ioBlueprint
