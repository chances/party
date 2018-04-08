import { Either } from 'monet'

import { Errors, get, post, Request, Response, ResponsePromise } from '../api'
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
  constructor(public partyCode: string, response?: Response<Party>) {
    super(response)
  }
}

export function getParty(): ResponsePromise<Party> {
  return get<Party>('party')
}

export function getPartyStream(): Source<Party> {
  return new Source('events/party', 'party')
}

export function getQueue(): ResponsePromise<Track[]> {
  return get<Track[]>('party/queue')
}

export function getQueueStream(partyStream: Source<Party>): Source<Track[]> {
  return new Source(partyStream, 'queue')
}

export function getHistory(): ResponsePromise<Track[]> {
  return get<Track[]>('party/history')
}

export function getHistoryStream(partyStream: Source<Party>): Source<Track[]> {
  return new Source(partyStream, 'history')
}

export function postJoinParty(partyCode: string): ResponsePromise<Party> {
  return post<Party>('party/join', {
    data: {room_code: partyCode},
  })
}

let joinPartyPromise: ResponsePromise<Party>

export function joinParty(payload: JoinParty) {
  if (joinPartyPromise != null && joinPartyPromise.isPending()) {
    joinPartyPromise.cancel()
  }

  joinPartyPromise = postJoinParty(payload.partyCode)
  joinPartyPromise.then(eitherParty => {
    // Only show party if it is not ended
    const maybeEnded = eitherParty.toMaybe().map(p => p.attributes.ended)
    if (maybeEnded.isJust() && maybeEnded.just()) {
      eitherParty = Either.Left(new Errors(401, [Errors.create(
        'Bad Request',
        `Party ${payload.partyCode} has ended`,
      )]))
    }
    // Otherwise show the party or error
    State.showParty(new JoinParty(
      payload.partyCode,
      eitherParty.leftMap(errors => {
        // Friendly Party not found error message
        if (errors.isNotFound) {
          errors.errors = [Errors.create(
            'Not Found',
            `Party ${payload.partyCode} not found`,
          )]
        }
        reportErrors(errors)
        return errors
      }).flatMap(party => {
        setUserContext({
          roomCode: party.attributes.room_code,
        })
        return Either.Right(party)
      }),
    ))
  })
}
