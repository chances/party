import { Maybe } from 'monet'
import { div, h1, p } from 'mostly-dom'

import { Party, Track } from '../models'
import State from '../state'
import * as util from '../util'

import header from './logo'
import currentTrack from './music/current-track'
import trackList from './music/track-list'

export default function render() {
  const tvMode = State.tvMode
  const party = State.party.just()
  const maybeTrack = Maybe.fromNull<Track>(party.current_track)
  const maybeQueue = State.queue.map(queue => queue.slice(0, 5))

  return content(party, maybeTrack, maybeQueue)
}

function content(party: Party, maybeTrack: Maybe<Track>, maybeQueue: Maybe<Track[]>) {
  return maybeTrack.cata(
    () => div({ attrs: { id: 'content' }, class: util.klass({ 'no-music': true }) }, [
      div([
        h1("Where's the music?"),
        p(`${party.location.host_name} isn't playing any music right now.`),
        p('Ask them to play something.'),
      ]),
    ]),
    track => div({ attrs: { id: 'content' } }, [
      currentTrack(track),
      trackList('upNext', 'Up Next', maybeQueue.cata(() => [], tracks => tracks)),
    ]),
  )
}
