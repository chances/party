// tslint:disable-next-line:no-implicit-dependencies
import Proxyquire from 'proxyquire'
import { expect, test, that } from './lib/expect'

import * as IRaven from 'raven-js'

// TODO: Follow this tutorial: https://ponyfoo.com/articles/testing-javascript-modules-with-tape

// tslint:disable-next-line:no-var-requires no-implicit-dependencies
const proxyquire: typeof Proxyquire = require('proxyquire').noPreserveCache();

// tslint:disable-next-line:no-unused-expression no-angle-bracket-type-assertion
<typeof IRaven> proxyquire('raven-js', {
  config: (dsnUrl: string) => {
    return {
      install: () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        const raven = {
          VERSION: 'mock',
          context: (fn: Function) => { return },
          captureException: (err: Error) => { return },
          setUserContext: (context?: any) => { return },
          captureBreadcrumb: (crumb: IRaven.Breadcrumb) => { return },
        } as IRaven.RavenStatic
        return raven
      },
    }
  },
})

test('can call captureBreadcrumb in development', t => {
  const { captureBreadcrumb } = require('../sentry')
  captureBreadcrumb('test')

  t.end()
})

test('can call captureBreadcrumb in production', t => {
  const { captureBreadcrumb } = require('../sentry')
  process.env.NODE_ENV = 'production'
  captureBreadcrumb('test')

  process.env.NODE_ENV = 'development'
  t.end()
})
