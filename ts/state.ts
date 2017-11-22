import localForage = require('localforage')
import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import Source from './api/event'
import Errors from './api/request/errors'
import { PartyError } from './api/request/errors'
import {
  getHistory, getHistoryStream,
  getParty, getPartyStream,
  getQueue, getQueueStream,
  JoinParty, joinParty, Party,
} from './models/party'
import { Track } from './models/track'
import * as util from './util'

useStrict(true)

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  @observable joining: Maybe<JoinParty>
  @observable party: Maybe<Party>
  @observable queue: Maybe<Track[]>
  @observable history: Maybe<Track[]>
  partyStream: Maybe<Source<Party>>
  queueStream: Maybe<Source<Track[]>>
  historyStream: Maybe<Source<Track[]>>

  constructor() {
    this.firstLaunch = true
    this.tvMode = false
    this.joining = Maybe.Nothing()
    this.party = Maybe.Nothing()
    this.queue = Maybe.Nothing()
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

    this.listenForUpdates().then(() => {
      // TODO: Preload all images; Or make images fade in somehow?
    })
  }

  @action updateParty(party: Party) {
    this.party = Maybe.fromNull(party)
  }

  @action updateQueue(queue: Track[]) {
    this.queue = Maybe.fromFalsy(queue)
  }

  @action updateHistory(history: Track[]) {
    this.history = Maybe.fromFalsy(history)
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
        this.ping()
          .then(() => this.listenForUpdates())
          .catch((err: PartyError) => {
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

  private listenForUpdates() {
    this.listenForPartyUpdates()
    return Promise.all([
      this.listenForQueueUpdates(),
      this.listenForHistoryUpdates(),
    ])
  }

  private listenForPartyUpdates() {
    this.partyStream = Maybe.fromNull(
      this.party.cata(() => null, party => {
        const stream = getPartyStream()
        this.observeStream(stream, updatedParty => this.updateParty(updatedParty))

        return stream
      }),
    )
  }

  private listenForQueueUpdates() {
    return getQueue().then(eitherQueue => {
      return eitherQueue.toMaybe().flatMap(queue => {
        this.updateQueue(queue.attributes)

        return this.partyStream
      })
    }).then(maybePartyStream => {
      this.queueStream = maybePartyStream.map(partyStream => {
        const stream = getQueueStream(partyStream)
        this.observeStream(stream, updatedQueue => this.updateQueue(updatedQueue))

        return stream
      })
    })
  }

  private listenForHistoryUpdates() {
    return getHistory().then(eitherHistory => {
      return eitherHistory.toMaybe().flatMap(history => {
        this.updateHistory(history.attributes)

        return this.partyStream
      })
    }).then(maybePartyStream => {
      this.historyStream = maybePartyStream.map(partyStream => {
        const stream = getHistoryStream(partyStream)
        this.observeStream(stream, updatedHistory => this.updateHistory(updatedHistory))

        return stream
      })
    })
  }

  private observeStream<T>(stream: Source<T>, handler: (event: T) => void) {
    stream.messages.recoverWith(err => {
      if (stream.isClosed) {
        throw err
      }

      // TODO: Send an event to Sentry? (with the current state)
      util.log('Party stream error: ', err)

      return stream.messages
    }).observe(event => handler(event)).catch(err => {
      util.log('Party stream closed: ', err)

      this.logout()
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
