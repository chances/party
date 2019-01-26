import { get, ResponsePromise } from '../api'

// tslint:disable-next-line:no-empty-interface
export interface Pong {}

export function getPing(): ResponsePromise<Pong> {
  return get<Pong>('party/ping')
}
