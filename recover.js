const most = require('most')

let cnt = 0

const createStream = () =>
  most.from(Array(9).fill(0))
    .scan(v => v + 1, 0)
    .tap(() => { 
      cnt += 1
      if (cnt % 3 && cnt < 10) {
        throw new Error('test')
      }
    })
    .recoverWith(e => createStream())
    .multicast()

const source = createStream()

source
  .tap(v => console.log('consumer 1', v))
  .drain()

source
  .tap(v => console.log('consumer 2', v))
  .drain()
