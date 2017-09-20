import { div } from '@cycle/dom'

import State from '../state'

import header from './logo'

import CurrentTrack from './music/current-track'
import TrackList from './music/track-list'

export class NowPlaying {
  state = {
    tvMode: false,
  }

  render() {
    const tvMode = State.tvMode
    return div('#content', [
      CurrentTrack.render(),
      new TrackList('upNext', 'Up Next').render(),
    ])
  }
}

const nowPlaying = new NowPlaying()
export default nowPlaying
