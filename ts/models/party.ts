import { Either, Maybe } from 'monet'

import { Errors, get, isResource, post, Request, Response, ResponsePromise } from '../api'
import { Document } from '../api/data'
import Source from '../api/event'
import { reportErrors, setUserContext } from '../sentry'
import State from '../state'
import { Track } from './track'

export interface Party {
  location: PartyLocation,
  room_code: string,
  ended: boolean,
  guests: string[],
  current_track?: Track,
}

interface PartyLocation {
  host_name: string
}

export class JoinParty extends Request<Party> {
  private joinPartyPromise: ResponsePromise<Party> | null = null

  constructor(partyCode: string)
  constructor(public partyCode: string) {
    super()
  }

  static fromResponse<T>(response: Response<T>) {
    return super.fromResponse(response)
  }

  send() {
    if (this.joinPartyPromise != null && this.joinPartyPromise.isPending()) {
      this.joinPartyPromise.cancel()
    }

    this.joinPartyPromise = post<Party>(
      'party/join',
      Document.NewResource('join', { room_code: this.partyCode }),
    )

    this.joinPartyPromise.then(eitherParty => {
      // Only show party if it is not ended
      const maybeEnded = eitherParty.toMaybe().map(p => isResource(p) && p.attributes.ended)
      if (maybeEnded.isJust() && maybeEnded.just()) {
        eitherParty = Either.Left(new Errors(401, [Errors.create(
          'Bad Request',
          `Party ${this.partyCode} has ended`,
        )]))
      }

      eitherParty.leftMap(errors => {
        // Friendly error message for 404 errors
        if (errors.isNotFound) {
          errors.errors = [Errors.create(
            'Not Found',
            `Party ${this.partyCode} not found`,
          )]
        }
        reportErrors(errors)
        return errors
      }).flatMap(party => {
        if (isResource(party)) {
          // Set the guest user context for Sentry errors
          // TODO: Refactor this to a Guest model
          setUserContext({
            roomCode: party.attributes.room_code,
          })
        }
        return Either.Right(party)
      })

      this.response = Maybe.Just(eitherParty)

      State.showParty(this)
    })
  }
}

export function getParty(): Request<Party> {
  const response = get<Party>('party')
  return Request.fromResponse(response)
}

export function getPartyStream(): Source<Party> {
  return new Source('events/party', 'party')
}

export function getQueue(): Request<Track[]> {
  const response = get<Track[]>('party/queue')
  return Request.fromResponse(response)
}

export function getQueueStream(partyStream: Source<Party>): Source<Track[]> {
  return new Source(partyStream, 'queue')
}

export function getHistory(): Request<Track[]> {
  const response = get<Track[]>('party/history')
  return Request.fromResponse(response)
}

export function getHistoryStream(partyStream: Source<Party>): Source<Track[]> {
  return new Source(partyStream, 'history')
}
