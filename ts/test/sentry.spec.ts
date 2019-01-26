// tslint:disable-next-line:no-implicit-dependencies
import * as Proxyquire from 'proxyquire'
import { test } from './lib/expect'

import * as IRaven from 'raven-js'

// TODO: Follow this tutorial: https://ponyfoo.com/articles/testing-javascript-modules-with-tape

// tslint:disable-next-line:no-var-requires no-implicit-dependencies
const proxyquire: typeof Proxyquire = require('proxyquire').noPreserveCache();

// tslint:disable-next-line:no-unused-expression no-angle-bracket-type-assertion
<typeof IRaven> proxyquire('raven-js', {
  config: (_dsnUrl: string) => {
    return {
      install: () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        const raven = {
          VERSION: 'mock',
          context: (_fn: Function) => { return },
          captureException: (_err: Error) => { return },
          setUserContext: (_context?: any) => { return },
          captureBreadcrumb: (_crumb: IRaven.Breadcrumb) => { return },
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
