import { create } from '@most/create'

import * as util from '../util'
import { getPartyApiHost } from './request'

enum ReadyState {

  /**
   * The connection has not yet been established, or it was closed and the user agent is
   * reconnecting.
   */
  CONNECTING = 0,

  /**
   * The user agent has an open connection and is dispatching events as it receives them.
   */
  OPEN = 1,

  /**
   * The connection is not open, and the user agent is not trying to reconnect. Either there
   * was a fatal error or the close() method was invoked.
   */
  CLOSED = 2,
}

export interface MessageEvent extends Event {
  data: string
}

export default class Source<T> {
  private eventSource: EventSource

  constructor(urlOrExistingSource: string | Source<any>, private messageName: string) {
    if (typeof urlOrExistingSource === 'string') {
      this.eventSource = new EventSource(
        `${getPartyApiHost()}${urlOrExistingSource}`,
        {
          withCredentials: true,
        },
      )
    } else {
      this.eventSource = urlOrExistingSource.eventSource
    }
  }

  static parseMessage<T>(e: MessageEvent) {
    util.log('Received message: ', e.data)
    return JSON.parse(e.data) as T
  }

  get isClosed() {
    return this.eventSource.readyState === ReadyState.CLOSED
  }

  get opened() {
    return this.on('open').map(e => {
      // tslint:disable-next-line:no-console
      console.log('Opened event stream for ' + this.messageName)
      return e
    })
  }

  get messages() {
    return this.on(this.messageName).map(e => Source.parseMessage<T>(e as MessageEvent))
  }

  on(eventType: 'open' | 'message' | string) {
    return create((add, end, error) => {
      const addEvent = (e: any) => {
        if (this.eventSource.readyState !== ReadyState.CLOSED) {
          add(e)
        } else {
          end()
        }
      }
      const addError = (_: any) => error(new Error('EventSource failed.'))

      this.eventSource.addEventListener(eventType, addEvent)
      this.eventSource.addEventListener('error', addError)

      return () => {
        this.eventSource.removeEventListener(eventType, addEvent)
        this.eventSource.removeEventListener('error', addError)
      }
    })
  }

  close() {
    this.eventSource.close()
  }
}
