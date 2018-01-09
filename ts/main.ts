import { render } from 'lit-html/lib/lit-extended'
import { autorun } from 'mobx'

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

const main = document.querySelector('main')
State.rehydrate().then(rehydrated => {
  if (main !== null) {
    main.classList.add('hiding')

    setTimeout(bootstrap, 300)
  }
})

function bootstrap() {
  const body = main ? main.parentElement : null
  if (main !== null && body !== null) {
    main.classList.remove('splash')
    main.classList.remove('hiding')

    autorun(() => {
      render(party(), body)

      State.persist()
    })

    if (State.party.isNothing()) {
      // Try to join party via hash
      State.tryToJoinViaHash()
    }
  }
}
