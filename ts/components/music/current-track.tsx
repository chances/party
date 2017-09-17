import * as Snabbdom from 'snabbdom-pragma'

import * as models from '../../models'
import * as Track from './track'

interface State {
  track: models.Track
}

export class CurrentTrack {
  state = {
    track: {
      id: '',
      name: 'Worries',
      artists: [{id: '', name: 'Submotion Orchestra'}],
      images: [
        {
          width: 1000,
          height: 1000,
          url: 'https://ninjatune.net/images/releases/alium-main.jpg',
        },
      ],
      endpoint: '',
      began_playing: '',
      duration: 120,
    },
  }

  render() {
    return Track.block('nowPlaying', 'Now Playing', this.state.track)
  }
}

const currentTrack = new CurrentTrack()
export default currentTrack
