const {
  kpStorage,
  kpDelays,
  kpIsTestRunning,
  kpIsTestStarted,
  kpIsTestCancelled,
  kpAllLampsCompleted,
  kpAllContactorsCompleted,
  kpBeforeContactorTurnoffDelay,
  kpBeforeNextContactorDelay,
  kpContactorEnabledTimestamp,
  kpContactorDisabledTimestamp,
  kpContactorEnabled,
  kpContactorsEncs,
} = require("../constants/keypaths");

const {
  getKPContactorTestEnded,
  getKPContactorsPassed,
  getKPContactorsOutput,
} = require('../constants/kp-creators')

const incrementEnabledContactors = (activeIO, encIndex, contactorIndex) =>
  activeIO
    .updateIn(
      getKPContactorsOutput(encIndex),
      a => a.map((v, i) => (i === contactorIndex)),
    )
    .updateIn(
      kpContactorEnabled,
      () => true,
    )
    .updateIn(
      getKPContactorsPassed(encIndex),
      () => contactorIndex + 1,
    )
    .updateIn(
      kpContactorEnabledTimestamp,
      () => Date.now(),
    )

const blinkContactorsInEnclosure = (activeIO, prevIO) =>
  (pv, encIndex) => {
    if (pv) {
      return pv
    }

    const encContactorsPassed = prevIO.getIn(getKPContactorsPassed(encIndex))
    const encContactors = prevIO.getIn(getKPContactorsOutput(encIndex))
    const encContactorsEnded = prevIO.getIn(getKPContactorTestEnded(encIndex))
    const isContactorEnabled = prevIO.getIn(kpContactorEnabled)

    // contactor was previously enabled and ON-delay has passed
    // disable contactor and set waiting time before enabling next contactor
    if (isContactorEnabled) {
      const updatedIO = activeIO
        .updateIn(
          kpContactorEnabled,
          () => false,
        )
        .updateIn(
          getKPContactorsOutput(encIndex),
          a => a.fill(false),
        )
        .updateIn(
          kpContactorDisabledTimestamp,
          () => Date.now(),
        )

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    // now enable every contactor sequentially
    // and set delay before disabling it
    if (encContactorsPassed < encContactors.length) {
      const contactorIndex = encContactorsPassed

      const updatedIO = incrementEnabledContactors(activeIO, encIndex, contactorIndex)

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    if ((encContactorsPassed === encContactors.length) && !encContactorsEnded) {
      const updatedIO = activeIO
        .updateIn(
          getKPContactorsOutput(encIndex),
          a => a.fill(false),
        )
        .updateIn(
          getKPContactorTestEnded(encIndex),
          () => true,
        )

      return {
        seed: updatedIO,
        value: updatedIO,
      }
    }

    return null
  }

const switchContactors = (prevIO, IO) => {
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

  const isLampTestCompleted = IO.getIn(kpAllLampsCompleted)

  /* return if lamps didn't completed the test */
  if (!isLampTestCompleted) {
    return {
      seed: IO,
      value: IO,
    }
  }

  const isContactorTestCompleted = prevIO.getIn(kpAllContactorsCompleted)

  /* return if all test passed */
  if (isContactorTestCompleted) {
    const updatedIO = IO
      .updateIn(
        kpAllContactorsCompleted,
        () => isContactorTestCompleted,
      )

    return {
      seed: prevIO,
      value: updatedIO,
    }
  }

  const contactorEnabledAt = prevIO.getIn(kpContactorEnabledTimestamp)
  const contactorDisabledAt = prevIO.getIn(kpContactorDisabledTimestamp)
  const turnoffDelay = IO.getIn(kpBeforeContactorTurnoffDelay)
  const turnonDelay = IO.getIn(kpBeforeNextContactorDelay)

  const isDelayed = ((contactorEnabledAt !== 0 && Date.now() < contactorEnabledAt + turnoffDelay) ||
    (contactorDisabledAt !== 0 && Date.now() < contactorDisabledAt + turnonDelay)
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

  /** ***************************
  *  Enable/disable contactors  *
  ***************************** */

  const encIndexList = IO.getIn(kpContactorsEncs)

  const allTestsAreCompleted = encIndexList
    .every(encIndex => prevIO.getIn(getKPContactorTestEnded(encIndex)))

  // mark test is running
  const activeIO = IO
    .updateIn(kpStorage, () => prevIO.getIn(kpStorage))
    .updateIn(kpDelays, () => prevIO.getIn(kpDelays))
    .updateIn(kpIsTestRunning, () => true)
    .updateIn(kpAllContactorsCompleted, () => allTestsAreCompleted)

  const updatedSeed = encIndexList.reduce(blinkContactorsInEnclosure(activeIO, prevIO), null)

  return updatedSeed || { seed: activeIO, value: activeIO }
}

module.exports = switchContactors
