import { div } from 'mostly-dom'

import State from '../state'

import header from './logo'
import currentTrack from './music/current-track'
import trackList from './music/track-list'

export default function render() {
  const tvMode = State.tvMode
  const track = State.party.map(party => party.current_track || null).orNull()

  return div({ id: 'content' }, [
    currentTrack(track),
    trackList('upNext', 'Up Next', null),
  ])
}
