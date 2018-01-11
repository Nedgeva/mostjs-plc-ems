const test = require('ava')
const most = require('most')
const ioScheme = require('../scheme/ioscheme')
const switchLamps = require('../logic/switchLamps')
const mockdate = require('mockdate')

const {
  kpIsTestStarted,
  kpLampTestCompleted,
} = require('../constants/keypaths')

const {
  getKPLampsOutputs,
} = require('../constants/kp-creators')

test.beforeEach((t) => {
  const ioWithTestEnabled = ioScheme
    .updateIn(kpIsTestStarted, () => true)

  const ioWithTestDisabled = ioScheme
    .updateIn(kpIsTestStarted, () => false)

  const ioSchemeList = [
    ioWithTestEnabled,
    ...Array(17).fill(ioWithTestDisabled),
  ]

  let cnt = 0
  const fastForwardTime = () => {
    cnt += 1
    mockdate.set(Date.now() + 1001)

    if (cnt === 5 || cnt === 15) {
      mockdate.set(Date.now() + 3001)
    }
  }

  Object.assign(t.context, {
    resultList: [],
  })

  const source = most
    .from(ioSchemeList)
    .loop(switchLamps, ioScheme)
    .tap(fastForwardTime)

  return source.observe(x => t.context.resultList.push(x))
})

test('lamps of enc 1 should turn on one by one, and then switchoff', (t) => {
  const keyPath1 = getKPLampsOutputs(1)
  const keyPath2 = getKPLampsOutputs(2)

  let truthCount = 0
  let falseCount = 4
  let i = 0

  // should enable lamps of enc 1 one by one
  for (i; i < 4; i += 1) {
    t.deepEqual(t.context.resultList[i].getIn(keyPath1), [
      ...Array(truthCount += 1).fill(true),
      ...Array(falseCount -= 1).fill(false),
    ])
  }

  // should disable all four lamps of enc 1 after 3sec
  t.deepEqual(t.context.resultList[i].getIn(keyPath1), Array(4).fill(false))

  // lamps of enc 2 should not be affected at all
  t.is(t.context.resultList.slice(0, i).every(io => (
    io.getIn(keyPath2).join() === Array(8).fill(false).join()
  )), true)
})

test('lamps of enc 2 should turn on one by one, and then switchoff', (t) => {
  const keyPath1 = getKPLampsOutputs(1)
  const keyPath2 = getKPLampsOutputs(2)

  let truthCount = 0
  let falseCount = 8
  let i = 6

  // should enable lamps of enc 2 one by one
  for (i; i < 6 + 8; i += 1) {
    t.deepEqual(t.context.resultList[i].getIn(keyPath2), [
      ...Array(truthCount += 1).fill(true),
      ...Array(falseCount -= 1).fill(false),
    ])
  }

  // should disable all four lamps of enc 2 after 3sec
  t.deepEqual(t.context.resultList[i].getIn(keyPath2), Array(8).fill(false))
})

test('lamp test should be completed', (t) => {
  t.is(t.context.resultList[16].getIn(kpLampTestCompleted), true)
})
