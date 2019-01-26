import { observable } from 'mobx'
// tslint:disable-next-line:no-implicit-dependencies
import proxyquire = require('proxyquire')
import { expect, test, that } from '../lib/expect'

import ISentry = require('../../sentry')
import { action } from '../../state/action'

// tslint:disable-next-line:no-unused-expression
proxyquire('../../sentry', {
  wrapWithBreadcrumb: (name: string, _data?: any) => {
    expect(that(name).equals('mutateProperty'))
  },
}) as typeof ISentry

class MockModel {
  @observable property: string | null = null

  @action mutateProperty(newValue: string) {
    this.property = newValue
  }

  invariantMutationOfProperty(newValue: string) {
    this.property = newValue
  }
}

test('action is wrapped with wrapBreadcrumb', t => {
  const model = new MockModel()

  model.mutateProperty('foo')
  expect(that(model.property).equals('foo'))

  t.end()
})
