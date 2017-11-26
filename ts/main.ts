import { autorun } from 'mobx'
import {
  createAttributesModule,
  createClassModule,
  createEventsModule,
  createStylesModule,
  elementToVNode, h, init } from 'mostly-dom'

import * as api from './api'
import State from './state'
import * as util from './util'

import party from './containers/party'

/* tslint:disable:no-submodule-imports no-var-requires */

// const augmentedMiddleware = process.env.NODE_ENV === 'development'
//   ? //do this
//   : //or that=

const partyApiHost = process.env.PARTY_API || 'https://party.chancesnow.me'
api.setPartyApiHost(util.log('Party API Host:', partyApiHost))

const patch = init([
  createAttributesModule(),
  createClassModule(),
  createEventsModule(),
  createStylesModule(),
])

const main = document.querySelector('main')
State.rehydrate().then(rehydrated => {
  if (main !== null) {
    main.classList.add('hiding')

    setTimeout(bootstrap, 300)
  }
})

function bootstrap() {
  if (main != null) {
    main.classList.remove('splash')
    main.classList.remove('hiding')
  }

  let vdom = patch(elementToVNode(main as Element), party())

  autorun(() => {
    vdom = patch(vdom, party())

    State.persist()
  })

  if (State.party.isNothing()) {
    // Try to join party via hash
    State.tryToJoinViaHash()
  }
}
