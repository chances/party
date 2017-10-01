import { Maybe } from 'monet'
import { div } from 'mostly-dom'

import { Track } from '../models'
import State from '../state'

import header from './logo'
import currentTrack from './music/current-track'
import trackList from './music/track-list'

export default function render() {
  const tvMode = State.tvMode
  const track = State.party.flatMap(party => Maybe.fromNull<Track>(party.current_track))

  return div({ id: 'content' }, [
    currentTrack(track),
    trackList('upNext', 'Up Next', null),
  ])
}
