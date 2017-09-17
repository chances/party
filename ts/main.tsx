// import localForage = require('localforage')
import { autorun } from 'mobx'
import * as snabbdom from 'snabbdom'
import * as Snabbdom from 'snabbdom-pragma'
import snabbdomClass from 'snabbdom/modules/class'
import snabbdomProps from 'snabbdom/modules/props'
import snabbdomStyle from 'snabbdom/modules/style'
// import { persistStore } from 'redux-persist'

import * as api from './api'
import * as util from './util'

import Party from './containers/party'

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

const patch = snabbdom.init([
  snabbdomClass,
  snabbdomProps,
  snabbdomStyle,
])

const main = document.querySelector('main')
if (main !== null) {
  main.classList.add('hiding')

  setTimeout(bootstrap, 300)
}

function bootstrap() {
  let vdom = patch(main as Element, Party.render())

  autorun(() => {
    vdom = patch(vdom, Party.render())
  })
}
