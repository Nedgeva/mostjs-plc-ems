const {
  kpStorage,
  kpDelays,
  kpLampIgnitionTimestamp,
  kpLampCompletionTimestamp,
  kpBeforeNextLampDelay,
  kpBeforeLampTurnOffDelay,
  kpAllLampsCompleted,
  kpIsTestRunning,
  kpIsTestStarted,
  kpIsTestCancelled,
  kpLampTestCompleted,
  kpLampsEncs,
} = require("../constants/keypaths");

const {
  getKPLampTestEnded,
  getKPLampsOutputs,
  getKPLampsCompleted,
  getKPLampsBlinked,
} = require('../constants/kp-creators')

const incrementEnabledLamp = (io, encIndex, lampIndex) =>
  io
    .updateIn(getKPLampsOutputs(encIndex), a => a.map((v, i) => (i <= lampIndex)))
    .updateIn(getKPLampsCompleted(encIndex), () => lampIndex + 1)
    .updateIn(kpLampIgnitionTimestamp, () => Date.now())

const disableAllLamps = (io, encIndex) =>
  io
    .updateIn(getKPLampsOutputs(encIndex), a => a.fill(false))

const blinkLampsInEnclosure = (activeIO, prevIO) =>
  (pv, encIndex) => {
    if (pv) {
      return pv
    }

    const encLampsBlinked = prevIO.getIn(getKPLampsBlinked(encIndex))
    const encLampsPassed = prevIO.getIn(getKPLampsCompleted(encIndex))
    const encLampsEnded = prevIO.getIn(getKPLampTestEnded(encIndex))
    const encLamps = prevIO.getIn(getKPLampsOutputs(encIndex))

    // now switch on every lamp sequentially
    // and wait for 1s
    if (encLampsPassed < encLamps.length) {
      const lampIndex = encLampsPassed

      const updatedIO = incrementEnabledLamp(activeIO, encIndex, lampIndex)

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    // mark enc lamp test completed
    if ((encLampsPassed === encLamps.length) && !encLampsBlinked) {
      const updatedIO = activeIO
        .updateIn(getKPLampsOutputs(encIndex), a => a.fill(true))
        .updateIn(getKPLampsCompleted(encIndex), () => encLampsPassed)
        .updateIn(kpLampCompletionTimestamp, () => Date.now())
        .updateIn(getKPLampsBlinked(encIndex), () => true)

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    // switch off all lamps of enclosure
    // and set 1s delay
    if (encLampsBlinked && !encLampsEnded) {
      const IOWithDisabledLamps = disableAllLamps(activeIO, encIndex)

      const updatedIO = IOWithDisabledLamps
        .updateIn(kpLampIgnitionTimestamp, () => Date.now())
        .updateIn(getKPLampTestEnded(encIndex), () => true)

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    return null
  }

const switchLamps = (prevIO, IO) => {
  const isTestStarted = IO.getIn(kpIsTestStarted)
  const isTestRunning = prevIO.getIn(kpIsTestRunning)
  const isTestCancelled = IO.getIn(kpIsTestCancelled)

  const isTestActive = ((isTestStarted || isTestRunning)
    && !isTestCancelled
  )

  /* return early if no test running */
  if (!isTestActive) {
    return {
      seed: prevIO,
      value: IO,
    }
  }

  const isLampTestCompleted = prevIO.getIn(kpAllLampsCompleted)

  /* return if all test passed */
  if (isLampTestCompleted) {
    const updatedIO = IO
      .updateIn(
        kpLampTestCompleted,
        () => prevIO.getIn(kpLampTestCompleted),
      )

    return {
      seed: prevIO,
      value: updatedIO,
    }
  }

  const lampIgnitedAt = prevIO.getIn(kpLampIgnitionTimestamp)
  const lampCompletedAt = prevIO.getIn(kpLampCompletionTimestamp)
  const lampDelay = IO.getIn(kpBeforeNextLampDelay)
  const encDelay = IO.getIn(kpBeforeLampTurnOffDelay)

  const isDelayed = ((lampIgnitedAt !== 0 && Date.now() < lampIgnitedAt + lampDelay) ||
    (lampCompletedAt !== 0 && Date.now() < lampCompletedAt + encDelay)
  )

  /* return if delayed */
  if (isDelayed) {
    const updatedIO = IO
      .updateIn(kpStorage, () => prevIO.getIn(kpStorage))
      .updateIn(kpDelays, () => prevIO.getIn(kpDelays))
      .updateIn(kpIsTestRunning, () => true)

    return {
      seed: prevIO,
      value: updatedIO,
    }
  }

  /** **********************
  *  Enable/disable lamps  *
  ************************ */

  const encIndexList = IO.getIn(kpLampsEncs)

  const allTestsAreCompleted = encIndexList
    .every(encIndex => prevIO.getIn(getKPLampTestEnded(encIndex)))

  // mark test is running
  const activeIO = IO
    .updateIn(kpStorage, () => prevIO.getIn(kpStorage))
    .updateIn(kpDelays, () => prevIO.getIn(kpDelays))
    .updateIn(kpIsTestRunning, () => true)
    .updateIn(kpLampTestCompleted, () => allTestsAreCompleted)

  const updatedSeed = encIndexList.reduce(blinkLampsInEnclosure(activeIO, prevIO), null)

  return updatedSeed || { seed: activeIO, value: activeIO }
}

module.exports = switchLamps
