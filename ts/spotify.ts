import Promise = require('bluebird')
import Spotify = require('spotify-web-api-js')

import { Either, Maybe } from 'monet'

const spotify = new Spotify()
spotify.setPromiseImplementation(Promise)

let accessToken: Maybe<string> = Maybe.Nothing<string>()

// Maybe TokenString -> Void
export function updateAccessToken(maybeToken: Maybe<string>) {
  accessToken = maybeToken

  if (maybeToken.isJust()) {
    spotify.setAccessToken(maybeToken.just())
  }
}

export type EitherTrackResults = Either<any, SpotifyApi.TrackSearchResponse>
export interface Options {limit: Maybe<number>, offset: Maybe<number>}

// String -> Maybe { limit: Maybe Number, offset: Maybe Number } ->
//    Promise (Either SpotifyError (Paging Track))
export function searchTracks(
  query: string,
  maybeOptions: Maybe<Options>,
) {
  // TODO: Handle maybeOptions
  query = query.split(' ').join('%20')

  return new Promise<EitherTrackResults>(resolve => {
    if (accessToken.isNothing()) {
      resolve(Either.Left<any, SpotifyApi.TrackSearchResponse>({
        error: 'invalid_token',
        error_description: 'No access token exists',
      }))
    } else {
      const searchResult = spotify.searchTracks(query, maybeOptions.cata(
        () => undefined,
        options => {
          return {
            offset: options.offset.cata(() => undefined, offset => offset),
            limit: options.limit.cata(() => undefined, limit => limit),
          }
        },
      ))
      searchResult
        .then(data => resolve(Either.Right(data)))
        .catch(error => resolve(Either.Left(error) as EitherTrackResults))
    }
  })
}
