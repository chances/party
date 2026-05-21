// tslint:disable-next-line:no-implicit-dependencies
import * as chai from 'chai'
// tslint:disable-next-line:no-implicit-dependencies
import tape = require('tape')

import * as util from '../../util'

let topic: tape.Test

// Mock window.location.search for usages of ts/util.ts
if (typeof globalThis.location === "undefined")
  globalThis.location = {} as unknown as Location;
globalThis.location.search = '';

type TestCase = (test: tape.Test) => PromiseLike<void> | void

export function test(name: string, cb: TestCase) {
  tape(name, t => {
    try {
      topic = t
      const ranTest = cb(t) as Promise<void> | void;

      // Call Test.end when an asynchronous test resolves, otherwise
      //  end the test for a synchronous test
      if (util.isPromise(ranTest)) {
        ranTest?.then(() => {
          t.end()
        }).catch(err => { throw err })
      } else {
        t.end()
      }
    } catch (e) {
      topic.fail(e instanceof Error ? e.message : String(e))
    }
  })
}

export const skip = tape.skip

export function expect(assertion: Chai.Assertion) {
  if (topic == null) {
    throw new Error('Test has no topic subject')
  }

  topic.ok(assertion)
}

export const that = chai.expect
