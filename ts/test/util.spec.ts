import { expect, test, that } from './lib/expect'

import { klass, log, queryParams } from '../util'

test('log returns logged value', t => {
  const value = 'foobar'

  expect(that(log('foo', value)).equals('foobar'))

  t.end()
})

test('log is curryable', t => {
  const fooLogger = log('foo')

  expect(that(fooLogger).is.an.instanceOf(Function))
  expect(that(fooLogger('foobar')).equals('foobar'))

  t.end()
})

test('queryParams emits empty map for empty query strings', t => {
  window.location.search = ''
  expect(that(Object.keys(queryParams()).length).equals(0))

  window.location.search = '?'
  expect(that(Object.keys(queryParams()).length).equals(0))

  window.location.search = ' &'
  expect(that(Object.keys(queryParams()).length).equals(0))

  t.end()
})

test('queryParams emits expected param map for given query strings', t => {
  window.location.search = '?foo'
  expect(that(queryParams()).includes({ foo: '' }))

  window.location.search = 'foo=bar'
  expect(that(queryParams()).includes({ foo: 'bar' }))

  window.location.search = '?foo=bar'
  expect(that(queryParams()).includes({ foo: 'bar' }))

  window.location.search = 'foo=bar&fizzbuzz'
  expect(that(queryParams()).includes({ foo: 'bar', fizzbuzz: '' }))

  t.end()
})

test('klass emits identity when all names are true', t => {
  const hiding = { hiding: true }
  const hidingAndSelected = { hiding: true, selected: true }

  expect(that(klass(hiding)).equals('hiding'))
  expect(that(klass(hidingAndSelected)).equals('hiding selected'))

  t.end()
})

test('klass emits only true names', t => {
  const hiding = { hiding: false }
  const notHidingAndSelected = { hiding: false, selected: true }

  expect(that(klass(hiding)).equals(''))
  expect(that(klass(notHidingAndSelected)).equals('selected'))

  t.end()
})
