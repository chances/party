import localForage = require('localforage')
import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import Source from './api/event'
import Errors from './api/request/errors'
import { getParty, getPartyStream, JoinParty, joinParty, Party } from './models/party'
import * as util from './util'

useStrict(true)

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  @observable joining: Maybe<JoinParty>
  @observable party: Maybe<Party>
  partyStream: Source<Party>

  constructor() {
    this.firstLaunch = true
    this.tvMode = false
    this.joining = Maybe.Nothing()
    this.party = Maybe.Nothing()
  }

  @action joinParty(partyCode: string) {
    const joinPartyRequest = new JoinParty(partyCode)
    joinParty(joinPartyRequest)
    this.joining = Maybe.Just(joinPartyRequest)
  }

  @action logout() {
    this.party = Maybe.Nothing()
  }

  @action showParty(joinPartyResponse: JoinParty) {
    this.joining = Maybe.Just(joinPartyResponse)
    this.party = joinPartyResponse.result

    this.listenForPartyUpdates()
  }

  @action updateParty(party: Party) {
    this.party = Maybe.fromNull<Party>(party)
  }

  // TODO: A leaveParty action; it should close the partyStream

  // Try to rehydrate state from cached storage
  rehydrate(): Promise<boolean> {
    return localForage.ready().then(() => {
      return localForage.getItem('state') as Promise<any>
    }).then(restoredState => {
      if (restoredState == null) {
        return false
      }

      this.firstLaunch = restoredState.firstLaunch
      this.tvMode = restoredState.tvMode
      this.party = Maybe.Just(restoredState.party)

      this.ping().then(() => {
        this.listenForPartyUpdates()
      }).catch((errors: Errors) => {
        if (errors.isUnauthorized) {
          this.logout()
        }
      })

      return true
    }).catch(() => {
      return false
    })
  }

  persist() {
    localForage.setItem(
      'state',
      util.log('State changed: ', this.toJs()),
    )
  }

  private ping() {
    return getParty().then(eitherParty => {
      eitherParty.cata(
        errors => {
          util.log('Error pinging party: ', errors)
          throw errors
        },
        response => this.updateParty(response.attributes),
      )
    })
  }

  private listenForPartyUpdates() {
    this.party.map(party => {
      const stream = getPartyStream()
      stream.messages.recoverWith(err => {
        // TODO: Send an event to Sentry? (with the current state)
        util.log('Party stream error: ', err)

        return stream.messages
      }).observe(this.updateParty)

      this.partyStream = stream
    })
  }

  private toJs(): any {
    return {
      firstLaunch: this.firstLaunch,
      tvMode: this.tvMode,
      party: this.party.orNull(),
    }
  }
}

const state = new State()
export default state
