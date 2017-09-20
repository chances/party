// import localForage = require('localforage')
import { div, h, MainDOMSource, makeDOMDriver, p } from '@cycle/dom'
import { run } from '@cycle/run'
import xs from 'xstream'
// import { persistStore } from 'redux-persist'

import * as api from './api'
import Sources from './sources'
import * as util from './util'

import party from './containers/party'

/* tslint:disable:no-submodule-imports no-var-requires */

// const augmentedMiddleware = process.env.NODE_ENV === 'development'
//   ? //do this
//   : //or that=

// persistStore(store, {
//   storage: localForage,
//   transforms: [persistTransform],
// })

const partyApiHost = process.env.PARTY_API || 'https://party.chancesnow.me'
api.setPartyApiHost(util.log('Party API Host:', partyApiHost))

function main(sources: Sources) {
  const party$ = party(sources)

  const sinks = {
    DOM: party$.map(partyView => h('main', {}, partyView)),
  }

  return sinks
}

function drivers(container: Element) {
  return {
    DOM: makeDOMDriver(container),
  }
}

// Bootstrap the app
const mainElem = document.querySelector('main')
if (mainElem !== null) {
  mainElem.classList.add('hiding')

  setTimeout(() => run(main, drivers(mainElem.parentNode as Element)), 500)
}
