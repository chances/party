import { div, h, h2, img, span, VNodeData } from '@cycle/dom'
import { Maybe } from 'monet'

import * as models from '../../models'
import { firstArtistName, largestImage } from '../../models'
import { TabProps } from '../tab'

interface TrackProps {
  value: models.Track
  elemType: 'div' | 'li'
}

type Props = TrackProps & TabProps

export function listItem(track: models.Track) {
  return new Track({ elemType: 'li', value: track }).render()
}

export function block(id: string, name: string, track: models.Track) {
  const heading = h2(name)
  return new Track({ elemType: 'div', value: track, id, heading }).render()
}

export default class Track {
  props: Props

  constructor(props: Props) {
    this.props = props
  }

  render() {
    const { id, heading } = this.props
    const track = this.props.value
    const {images, name, artists, contributor} = track
    const image = largestImage(images)

    const requestedBy = contributor
        ? span('.requested-by', 'Added by' + contributor)
        : null

    const content = [
      div('.song-info', [
        span('.title', name),
        span('.artist', firstArtistName(artists)),
        requestedBy,
      ]),
    ]

    if (image.isJust()) {
      content.unshift(
        img({ attrs: { src: image.just().url } }),
      )
    } // TODO: "Blank" album art if image is nothing

    if (heading) {
      content.unshift(heading)
    }

    const trackElemProps: VNodeData = {
      class: { track: true },
    }
    if (id) {
      trackElemProps.id = id
    }
    if (this.props.elemType === 'li') {
      trackElemProps.key = track.id
    }
    return h(this.props.elemType, trackElemProps, content)
  }
}
