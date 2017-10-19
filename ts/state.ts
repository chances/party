import localForage = require('localforage')
import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import { JoinParty, joinParty, Party } from './models/party'

useStrict(true)

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  @observable joining: Maybe<JoinParty>
  @observable party: Maybe<Party>

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

  @action showParty(joinPartyResponse: JoinParty) {
    this.joining = Maybe.Just(joinPartyResponse)
    this.party = joinPartyResponse.result
  }

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

      return true
    }).catch(() => {
      return false
    })
  }

  persist() {
    localForage.setItem('state', this.toJs())
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
