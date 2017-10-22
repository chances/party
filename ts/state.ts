import localForage = require('localforage')
import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import Source from './api/event'
import Errors from './api/request/errors'
import { PartyError } from './api/request/errors'
import { getParty, getPartyStream, JoinParty, joinParty, Party } from './models/party'
import * as util from './util'

useStrict(true)

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  @observable joining: Maybe<JoinParty>
  @observable party: Maybe<Party>
  partyStream: Maybe<Source<Party>>

  constructor() {
    this.firstLaunch = true
    this.tvMode = false
    this.joining = Maybe.Nothing()
    this.party = Maybe.Nothing()
    this.partyStream = Maybe.Nothing()
  }

  @action joinParty(partyCode: string) {
    const joinPartyRequest = new JoinParty(partyCode)
    joinParty(joinPartyRequest)
    this.joining = Maybe.Just(joinPartyRequest)
  }

  @action logout() {
    this.party = Maybe.Nothing()
    this.partyStream.map(stream => stream.close())
    this.partyStream = Maybe.Nothing()
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
      this.party = Maybe.fromNull(restoredState.party)

      this.party.map(() => {
        this.ping().then(() => {
          this.listenForPartyUpdates()
        }).catch((err: PartyError) => {
          this.logout()
        })
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
          throw errors.toError()
        },
        response => this.updateParty(response.attributes),
      )
    })
  }

  private listenForPartyUpdates() {
    this.partyStream = Maybe.fromNull(
      this.party.cata(() => null, party => {
        const stream = getPartyStream()
        stream.messages.recoverWith(err => {
          if (stream.isClosed) {
            throw err
          }

          // TODO: Send an event to Sentry? (with the current state)
          util.log('Party stream error: ', err)

          return stream.messages
        }).observe(updatedParty => this.updateParty(updatedParty)).catch(err => {
          util.log('Party stream closed: ', err)

          this.logout()
        })

        return stream
      }),
    )
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
