import Promise = require('bluebird')
import localForage = require('localforage')
import { configure, observable } from 'mobx'
import { Maybe } from 'monet'

import Source from '../api/event'
import { isResource } from '../api/requests/primitives'
import {
  getHistory, // getHistoryStream,
  getParty, getPartyStream,
  getQueue, // getQueueStream,
  JoinParty, Party,
} from '../models/party'
import { Track } from '../models/track'
import { captureBreadcrumb, captureException, setUserContext } from '../sentry'
import * as util from '../util'

import { action } from './action'
import Router from './router'

export { Route } from './router'

configure({ enforceActions: 'observed' })

localForage.config({ name: 'party' })

export class State {
  firstLaunch: boolean
  @observable tvMode: boolean
  router: Router

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
    this.router = new Router()
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
    const request = new JoinParty(partyCode)
    request.send()
    this.joining = Maybe.Just(request)
  }

  @action logout() {
    this.party = Maybe.Nothing()
    this.partyStream.forEach(stream => stream.close())
    this.partyStream = Maybe.Nothing()
    setUserContext()
  }

  @action showParty(joinResponse: JoinParty) {
    this.joining = Maybe.Just(joinResponse)
    if (joinResponse.isErrored) {
      return
    }
    this.party = joinResponse.responseData

    this.router.navigate(Router.mainTabs.music)

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
    maybePartyCode.forEach(partyCode => {
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

        return getParty().promise
      }).then(eitherParty => {
        eitherParty.cata(errors => {
          this.logout()
          captureException('Could not fetch party', { errors })
        }, partyData => {
          if (!isResource(partyData)) {
            this.logout()
            return
          }

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

  private listenForUpdates() {
    this.listenForPartyUpdates()
    // TODO: Add Queue and History event streams to server
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
    const request = getQueue()
    return request.promise.then(_ => {
      request.responseData.forEach(this.updateQueue)
      return this.partyStream
    })/*.then(maybePartyStream => {
      this.queueStream = maybePartyStream.map(partyStream => getQueueStream(partyStream))
        .map(queueStream => {
          this.observeStream(queueStream, updatedQueue => this.updateQueue(updatedQueue))
          return queueStream
        })
    })*/
  }

  private listenForHistoryUpdates() {
    const request = getHistory()
    return request.promise.then(_ => {
      request.responseData.forEach(this.updateHistory)
      return this.partyStream
    })/*.then(maybePartyStream => {
      this.historyStream = maybePartyStream
        .map(partyStream => getHistoryStream(partyStream))
        .map(historyStream => {
          this.observeStream(historyStream, updatedHistory => this.updateHistory(updatedHistory))
          return historyStream
        })
    })*/
  }

  private observeStream<T>(stream: Source<T>, handler: (event: T) => void) {
    stream.messages.recoverWith(err => {
      if (stream.isClosed) {
        throw err
      }

      // TODO: Send an event to Sentry? (with the current state)
      util.log(`${stream.name} stream error: `, err)

      return stream.messages
    }).observe(event => handler(event.data)).catch(err => {
      util.log(`${stream.name} stream closed: `, err)
      captureException(err)

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
