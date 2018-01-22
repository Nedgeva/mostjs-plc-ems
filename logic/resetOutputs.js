const {
  kpIsTestCancelled,
  kpDiscreteOutputs,
} = require('../constants/keypaths')

const resetOutputs = (prevIO, IO) => {
  const isTestCancelled = IO.getIn(kpIsTestCancelled)

  /* reset outputs and store if test is cancelled */
  if (isTestCancelled) {
    const updatedIO = IO
      .updateIn(
        kpDiscreteOutputs,
        () => prevIO.getIn(kpDiscreteOutputs),
      )

    return {
      seed: prevIO,
      value: updatedIO,
    }
  }

  return {
    seed: prevIO,
    value: IO,
  }
}

module.exports = resetOutputs
