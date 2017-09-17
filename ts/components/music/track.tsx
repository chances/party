import { Maybe } from 'monet'
import * as Snabbdom from 'snabbdom-pragma'
import { VNodeData } from 'snabbdom/vnode'

import * as models from '../../models'
import { firstArtistName, largestImage } from '../../models'
import { TabProps } from '../tab'

interface TrackProps {
  value: models.Track
  elemType: 'div' | 'li'
}

type Props = TrackProps & TabProps

export function listItem(track: models.Track) {
  return <Track type="li" value={track} />
}

export function block(id: string, name: string, track: models.Track) {
  const heading = <h2>{name}</h2>
  return <Track type="div" value={track} id={id} heading={heading} />
}

export default class Track {
  props: Props

  constructor(props: Props) {
    this.props = props
  }

  render({id, heading}: Props) {
    const track = this.props.value
    const {images, name, artists, contributor} = track
    const image = largestImage(images)

    const requestedBy = contributor
        ? <span class={{ 'requested-by': true }}>Added by {contributor}</span>
        : null

    const content = [
      // tslint:disable-next-line:jsx-key
      <div class={{'song-info': true }}>
        <span class={{ title: true }}>{name}</span>
        <span class={{ artist: true }}>{firstArtistName(artists)}</span>
        { requestedBy }
      </div>,
    ]

    if (image.isJust()) {
      content.unshift(
        <img src={image.just().url} />,
      )
    }

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
    return Snabbdom.createElement(this.props.elemType, trackElemProps, content)
  }
}
