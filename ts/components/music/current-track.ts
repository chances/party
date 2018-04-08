import * as models from '../../models'
import * as Track from './track'

export default function render(track: models.Track) {
  return Track.block('nowPlaying', 'Now Playing', track)
}
