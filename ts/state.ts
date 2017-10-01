import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import { JoinParty, joinParty, Party } from './models/party'

useStrict(true)

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
}

const state = new State()
export default state

/*

const Actions = {
  Rehydrate: createAction<State>(REHYDRATE),
}

*/