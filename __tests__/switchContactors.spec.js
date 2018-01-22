const test = require('ava')
const most = require('most')
const ioScheme = require('../scheme/ioscheme')
const switchContactors = require('../logic/switchContactors')
const mockdate = require('mockdate')

const {
  kpIsTestStarted,
  kpIsTestCancelled,
  kpLampTestCompleted,
  kpAllContactorsCompleted,
} = require('../constants/keypaths')

const {
  getKPContactorsOutput,
} = require('../constants/kp-creators')

test.beforeEach((t) => {
  const enc1ContactorsNum = ioScheme
    .getIn(getKPContactorsOutput(1))
    .length

  const enc2ContactorsNum = ioScheme
    .getIn(getKPContactorsOutput(2))
    .length

  const enc4ContactorsNum = ioScheme
    .getIn(getKPContactorsOutput(4))
    .length

  const ioWithTestDisabled = ioScheme
    .updateIn(kpIsTestStarted, () => false)

  const ioWithTestEnabled = ioScheme
    .updateIn(kpIsTestStarted, () => true)

  const ioWithTestEnabledAndLampTestPassed = ioScheme
    .updateIn(kpIsTestStarted, () => true)
    .updateIn(kpLampTestCompleted, () => true)

  const ioWithTestDisabledAndLampTestPassed = ioScheme
    .updateIn(kpIsTestStarted, () => false)
    .updateIn(kpLampTestCompleted, () => true)

  const ioSchemeList = [
    ioWithTestDisabled,
    ioWithTestEnabled,
    ioWithTestEnabledAndLampTestPassed,
    ...Array(173).fill(ioWithTestDisabledAndLampTestPassed),
  ]

  const fastForwardTime = () => {
    mockdate.set(Date.now() + 2001)
  }

  Object.assign(t.context, {
    resultList: [],
    ioWithTestDisabled,
    ioWithTestEnabled,
    enc1ContactorsNum,
    enc2ContactorsNum,
    enc4ContactorsNum,
  })

  const source = most
    .from(ioSchemeList)
    .loop(switchContactors, ioScheme)
    .tap(fastForwardTime)

  return source.observe(x => t.context.resultList.push(x))
})

test('should not modify io scheme if no test is running', (t) => {
  const io = t.context.resultList[0]
  t.is(io.equals(t.context.ioWithTestDisabled), true)
})

test('should not test contactors before lamps are tested', (t) => {
  const io = t.context.resultList[1]
  t.is(io.equals(t.context.ioWithTestEnabled), true)
})

test('should enable/disable contactors one by one in enc 1', (t) => {
  let truthIndex = 0
  let i = 2

  for (i; i < 2 + (t.context.enc1ContactorsNum * 2); i += 2) {
    const masterArray = Array(t.context.enc1ContactorsNum).fill(false)
    masterArray[truthIndex] = true

    t.deepEqual(
      t.context.resultList[i].getIn(getKPContactorsOutput(1)),
      masterArray,
    )

    truthIndex += 1
  }
})

test('should enable/disable contactors one by one in enc 2', (t) => {
  const startIndex = 2 + (t.context.enc1ContactorsNum * 2) + 1
  let truthIndex = 0
  let i = startIndex

  for (i; i < startIndex + (t.context.enc2ContactorsNum * 2); i += 2) {
    const masterArray = Array(t.context.enc2ContactorsNum).fill(false)
    masterArray[truthIndex] = true

    t.deepEqual(
      t.context.resultList[i].getIn(getKPContactorsOutput(2)),
      masterArray,
    )

    truthIndex += 1
  }
})

test('should enable/disable contactors one by one in enc 4', (t) => {
  const startIndex = 2
    + (t.context.enc1ContactorsNum * 2)
    + 1
    + (t.context.enc2ContactorsNum * 2)
    + 1

  let truthIndex = 0
  let i = startIndex

  for (i; i < startIndex + (t.context.enc4ContactorsNum * 2); i += 2) {
    const masterArray = Array(t.context.enc4ContactorsNum).fill(false)
    masterArray[truthIndex] = true

    t.deepEqual(
      t.context.resultList[i].getIn(getKPContactorsOutput(4)),
      masterArray,
    )

    truthIndex += 1
  }
})

test('contactor test should be completed', (t) => {
  const startIndex = 2
    + (t.context.enc1ContactorsNum * 2)
    + 1
    + (t.context.enc2ContactorsNum * 2)
    + 1
    + (t.context.enc4ContactorsNum * 2)
    + 1

  t.is(t.context.resultList[startIndex].getIn(kpAllContactorsCompleted), true)
})

test('contactor test should pay respect to cancellation', (t) => {
  const keyPath1 = getKPContactorsOutput(1)

  /* prepare test and run mostjs stream */
  const ioWithTestEnabledAndLampTestPassed = ioScheme
    .updateIn(kpIsTestStarted, () => true)
    .updateIn(kpLampTestCompleted, () => true)

  const ioWithTestCancelled = ioScheme
    .updateIn(kpIsTestCancelled, () => true)
    .updateIn(kpLampTestCompleted, () => true)

  const ioSchemeList = [
    ...Array(2).fill(ioWithTestEnabledAndLampTestPassed),
    ioWithTestCancelled,
    ...Array(6).fill(ioScheme.updateIn(kpLampTestCompleted, () => true)),
  ]

  const source = most
    .from(ioSchemeList)
    .loop(switchContactors, ioScheme)
    .tap(() => mockdate.set(Date.now() + 2001))

  const resultList = []

  return source
    .observe(x => resultList.push(x))
    .then(() => t.deepEqual(
      resultList[4].getIn(keyPath1),
      Array(t.context.enc1ContactorsNum).fill(false),
    ))
})
