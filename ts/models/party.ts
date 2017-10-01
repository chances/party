import { Either, Maybe } from 'monet'

import { Errors, post, Request, Response, ResponsePromise } from '../api'
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

export function getParty(partyCode: string): ResponsePromise<Party> {
  return post<Party>('party/join', {
    data: {room_code: partyCode},
  })
}

let joinPartyPromise: ResponsePromise<Party>

export function joinParty(payload: JoinParty) {
  payload.response.cata(
    () => {
      if (joinPartyPromise != null) {
        joinPartyPromise.cancel()
      }

      joinPartyPromise = getParty(payload.partyCode)
      joinPartyPromise.then(eitherParty => {
        State.joinPartyResponse(new JoinParty(
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
    },
    eitherParty => {
      State.showParty(
        eitherParty.toMaybe().map(party => party.attributes),
      )
    },
  )
}
