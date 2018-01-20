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
  const enc1LampsNum = ioScheme
    .getIn(getKPLampsOutputs(1))
    .length

  const enc2LampsNum = ioScheme
    .getIn(getKPLampsOutputs(2))
    .length

  const enc4LampsNum = ioScheme
    .getIn(getKPLampsOutputs(4))
    .length

  const ioWithTestEnabled = ioScheme
    .updateIn(kpIsTestStarted, () => true)

  const ioWithTestDisabled = ioScheme
    .updateIn(kpIsTestStarted, () => false)

  const ioSchemeList = [
    ioWithTestEnabled,
    ...Array(100).fill(ioWithTestDisabled),
  ]

  const pauseIdxEnc1 = enc1LampsNum + 1
  const pauseIdxEnc2 = pauseIdxEnc1 + enc2LampsNum + 2
  const pauseIdxEnc4 = pauseIdxEnc2 + enc4LampsNum + 2

  let cnt = 0
  const fastForwardTime = () => {
    cnt += 1
    mockdate.set(Date.now() + 1001)

    if ([pauseIdxEnc1, pauseIdxEnc2, pauseIdxEnc4].includes(cnt)) {
      mockdate.set(Date.now() + 3001)
    }
  }

  Object.assign(t.context, {
    enc1LampsNum,
    enc2LampsNum,
    enc4LampsNum,
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
  let falseCount = t.context.enc1LampsNum
  let i = 0

  // should enable lamps of enc 1 one by one
  for (i; i < t.context.enc1LampsNum; i += 1) {
    t.deepEqual(t.context.resultList[i].getIn(keyPath1), [
      ...Array(truthCount += 1).fill(true),
      ...Array(falseCount -= 1).fill(false),
    ])
  }

  // should disable all four lamps of enc 1 after 3sec
  t.deepEqual(
    t.context.resultList[i].getIn(keyPath1),
    Array(t.context.enc1LampsNum).fill(false),
  )

  // lamps of enc 2 should not be affected at all
  t.is(t.context.resultList.slice(0, i).every(io => (
    io.getIn(keyPath2).join() === Array(t.context.enc2LampsNum)
      .fill(false)
      .join()
  )), true)
})

test('lamps of enc 2 should turn on one by one, and then switchoff', (t) => {
  const keyPath2 = getKPLampsOutputs(2)

  const startIndex = 2 + t.context.enc1LampsNum
  let truthCount = 0
  let falseCount = t.context.enc2LampsNum
  let i = startIndex

  // should enable lamps of enc 2 one by one
  for (i; i < startIndex + t.context.enc2LampsNum; i += 1) {
    t.deepEqual(t.context.resultList[i].getIn(keyPath2), [
      ...Array(truthCount += 1).fill(true),
      ...Array(falseCount -= 1).fill(false),
    ])
  }

  // should disable all four lamps of enc 2 after 3sec
  t.deepEqual(
    t.context.resultList[i].getIn(keyPath2),
    Array(t.context.enc2LampsNum).fill(false)
  )
})

test('lamps of enc 4 should turn on one by one, and then switchoff', (t) => {
  const keyPath2 = getKPLampsOutputs(2)
  const keyPath4 = getKPLampsOutputs(4)

  const startIndex = 2 
    + t.context.enc1LampsNum
    + 2
    + t.context.enc2LampsNum

  let truthCount = 0
  let falseCount = t.context.enc4LampsNum
  let i = startIndex

  // should enable lamps of enc 4 one by one
  for (i; i < startIndex + t.context.enc4LampsNum; i += 1) {
    t.deepEqual(t.context.resultList[i].getIn(keyPath4), [
      ...Array(truthCount += 1).fill(true),
      ...Array(falseCount -= 1).fill(false),
    ])
  }

  // should disable all four lamps of enc 2 after 3sec
  t.deepEqual(
    t.context.resultList[i].getIn(keyPath4),
    Array(t.context.enc4LampsNum).fill(false)
  )
})

test('lamp test should be completed', (t) => {
  const startIndex = 2 
    + t.context.enc1LampsNum
    + 2
    + t.context.enc2LampsNum
    + 2
    + t.context.enc4LampsNum

  t.is(t.context.resultList[startIndex].getIn(kpLampTestCompleted), true)
})
