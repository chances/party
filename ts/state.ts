import { Either, Maybe } from 'monet'

import { JoinParty, joinParty, Party } from './models/party'

export class State {
  firstLaunch: boolean
  tvMode: boolean
  joining: Maybe<JoinParty>
  party: Maybe<Party>

  constructor() {
    this.firstLaunch = true
    this.tvMode = false
    this.joining = Maybe.Nothing()
    this.party = Maybe.Nothing()
  }

  joinParty(partyCode: string) {
    const joinPartyRequest = new JoinParty(partyCode)
    joinParty(joinPartyRequest)
    this.joining = Maybe.Just(joinPartyRequest)
  }

  showParty(party: Maybe<Party>) {
    this.party = party
  }
}

const state = new State()
export default state

/*

const Actions = {
  Rehydrate: createAction<State>(REHYDRATE),
}

*/
