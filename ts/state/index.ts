import Promise = require('bluebird')
import localForage = require('localforage')
import { action, observable, useStrict } from 'mobx'
import { Either, Maybe } from 'monet'

import Source from '../api/event'
import { PartyError } from '../api/request/errors'
import { Data } from '../api/request/primitives'
import {
  getHistory, getHistoryStream,
  getParty, getPartyStream,
  getQueue, getQueueStream,
  JoinParty, joinParty, Party,
} from '../models/party'
import { Track } from '../models/track'
import { captureBreadcrumb, setUserContext } from '../sentry'
import * as util from '../util'

import Menu, { MainTab, MusicTab, Route } from './menu'

export { Route } from './menu'

useStrict(true)

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  menu: Menu

  @observable partyCode: Maybe<string>
  @observable joining: Maybe<JoinParty>
  @observable party: Maybe<Party>
  @observable queue: Maybe<Track[]>
  @observable history: Maybe<Track[]>
  partyStream: Maybe<Source<Party>>
  queueStream: Maybe<Source<Track[]>>
  historyStream: Maybe<Source<Track[]>>

  constructor() {
    this.firstLaunch = true
    this.tvMode = util.queryParams().tvMode != null
    this.menu = new Menu()
    this.partyCode = Maybe.Nothing()
    this.joining = Maybe.Nothing()
    this.party = Maybe.Nothing()
    this.queue = Maybe.Nothing()
    this.history = Maybe.Nothing()
    this.partyStream = Maybe.Nothing()
    this.queueStream = Maybe.Nothing()
    this.historyStream = Maybe.Nothing()
  }

  @action joinParty(partyCode: string) {
    this.partyCode = Maybe.Just(partyCode)
    const joinPartyRequest = new JoinParty(partyCode)
    joinParty(joinPartyRequest)
    this.joining = Maybe.Just(joinPartyRequest)
  }

  @action logout() {
    this.party = Maybe.Nothing()
    this.partyStream.map(stream => stream.close())
    this.partyStream = Maybe.Nothing()
    setUserContext()
  }

  @action showParty(joinResponse: JoinParty) {
    this.joining = Maybe.Just(joinResponse)
    if (joinResponse.isErrored) {
      return
    }
    this.party = joinResponse.result

    window.history.replaceState('', '', '/party#music')

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

  // Try to join party via hash
  tryToJoinViaHash() {
    const hash = window.location.hash.replace('#', '').split('/')[0]
    const maybePartyCode = Maybe.fromFalsy(hash)
    maybePartyCode.map(partyCode => {
      if (partyCode.match(/^[A-Z0-9]{4}$/i)) {
        this.joinParty(partyCode)
      }
    })
  }

  // Try to rehydrate state from cached storage
  rehydrate(): Promise<boolean> {
    return new Promise(resolve => {
      localForage.ready().then(() => {
        return localForage.getItem('state')
      }).then((restoredState: any) => {
        if (restoredState == null) {
          throw false
        }

        this.firstLaunch = false
        this.partyCode = Maybe.fromFalsy(restoredState.partyCode)
        this.party = Maybe.fromFalsy(restoredState.party)

        return this.ping()
      }).then((eitherParty: Either<PartyError, Data<Party>>) => {
        eitherParty.cata(_ => {
          this.logout()
        }, partyData => {
          const party = partyData.attributes
          if (party.ended) {
            util.log('Party ended: ', party)
            this.logout()
            return
          }
          this.updateParty(party)
          this.listenForUpdates()
        })

        resolve(true)
      }).catch(() => {
        resolve(false)
      })
    })
  }

  persist() {
    const snapshot = this.toJs()
    localForage.setItem(
      'state',
      util.log('State changed: ', snapshot),
    )
    captureBreadcrumb('state', snapshot)
  }

  private ping() {
    return getParty().then(eitherParty => {
      return eitherParty.leftMap(errors => {
        return errors.toError()
      })
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
      this.party.cata(() => null, _ => {
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
      partyCode: this.partyCode.orNull(),
      party: this.party.orNull(),
    }
  }
}

const state = new State()
export default state
