import * as models from '../../models'
import * as Track from './track'

interface State {
  track: models.Track
}

const defaultState = {
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

export default function render(track: models.Track | null) {
  return Track.block('nowPlaying', 'Now Playing', track || defaultState.track)
}
