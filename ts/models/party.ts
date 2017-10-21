import { Either, Maybe } from 'monet'

import { Errors, get, post, Request, Response, ResponsePromise } from '../api'
import Source from '../api/event'
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
    // TODO: Only show party if party response is not ended
    State.showParty(new JoinParty(
      payload.partyCode,
      eitherParty.leftMap(errors => {
        // Friendly Party not found error message
        if (errors.responseStatus === 404) {
          errors.errors = [Errors.create(
            'Not Found',
            `Party ${payload.partyCode} not found`,
          )]
        }
        return errors
      }),
    ))
  })
}
