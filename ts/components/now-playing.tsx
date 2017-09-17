import * as Snabbdom from 'snabbdom-pragma'

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
    return <div id="content">
      { CurrentTrack.render() }
      <TrackList id="upNext" name="Up Next" />
    </div>
  }
}

const nowPlaying = new NowPlaying()
export default nowPlaying
