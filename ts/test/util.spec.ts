import { expect, test, that } from './lib/expect'

import { klass, log, queryParams, toKebabCase } from '../util'

test('log returns logged value', _t => {
  const value = 'foobar'

  expect(that(log('foo', value)).equals('foobar'))
})

test('log is curryable', _t => {
  const fooLogger = log('foo')

  expect(that(fooLogger).is.an.instanceOf(Function))
  expect(that(fooLogger('foobar')).equals('foobar'))
})

test('toKebabCase emits empty string for empty input', _t => {
  expect(that(toKebabCase('')).equals(''))

  expect(that(toKebabCase('  ')).equals(''))
})

test('toKebabCase emits expected kebab casing for given inputs', _t => {
  expect(that(toKebabCase('foobar')).equals('foobar'))

  expect(that(toKebabCase('Foobar')).equals('foobar'))

  expect(that(toKebabCase('FoobarFizzbuzz')).equals('foobar-fizzbuzz'))

  expect(that(toKebabCase('Party')).equals('party'))
})

test('queryParams emits empty map for empty query strings', _t => {
  window.location.search = ''
  expect(that(Object.keys(queryParams()).length).equals(0))

  window.location.search = '?'
  expect(that(Object.keys(queryParams()).length).equals(0))

  window.location.search = ' &'
  expect(that(Object.keys(queryParams()).length).equals(0))
})

test('queryParams emits expected param map for given query strings', _t => {
  window.location.search = '?foo'
  expect(that(queryParams()).includes({ foo: '' }))

  window.location.search = 'foo=bar'
  expect(that(queryParams()).includes({ foo: 'bar' }))

  window.location.search = '?foo=bar'
  expect(that(queryParams()).includes({ foo: 'bar' }))

  window.location.search = 'foo=bar&fizzbuzz'
  expect(that(queryParams()).includes({ foo: 'bar', fizzbuzz: '' }))
})

test('klass emits identity when all names are true', _t => {
  const hiding = { hiding: true }
  const hidingAndSelected = { hiding: true, selected: true }

  expect(that(klass(hiding)).equals('hiding'))
  expect(that(klass(hidingAndSelected)).equals('hiding selected'))
})

test('klass emits only true names', _t => {
  const hiding = { hiding: false }
  const notHidingAndSelected = { hiding: false, selected: true }

  expect(that(klass(hiding)).equals(''))
  expect(that(klass(notHidingAndSelected)).equals('selected'))
})
