import { Maybe } from 'monet'
import { div, h, h2, img, span, VNode, VNodeProps } from 'mostly-dom'

import * as models from '../../models'
import { firstArtistName, largestImage } from '../../models'
import { TabProps } from '../tab'

interface TrackProps {
  value: models.Track
  elemType: 'div' | 'li'
}

type Props = TrackProps & TabProps

export function listItem(t: models.Track) {
  return track('li', t)
}

export function block(id: string, name: string, t: models.Track) {
  const heading = h2(name)
  return track('div', t, id, heading)
}

// tslint:disable-next-line:max-line-length
export default function track(type: 'div' | 'li', t: models.Track, id?: string, heading?: VNode) {
  const {images, name, artists, contributor} = t
  const image = largestImage(images)

  const requestedBy = contributor
      ? span({ class: { 'requested-by': true } }, [ 'Added by ', contributor ])
      : null

  const content: VNode[] = [
    div({ class: { 'song-info': true } }, [
      span({ class: { title: true } }, name),
      span({ class: { artist: true } }, firstArtistName(artists)),
      requestedBy,
    ]),
  ]

  if (image.isJust()) {
    content.unshift(
      img({ attrs: { src: image.just().url } }),
    )
  }

  if (heading) {
    content.unshift(heading)
  }

  const trackElemProps: VNodeProps = {
    class: { track: true },
  }
  if (id) {
    trackElemProps.attrs = { id }
  }
  if (type === 'li') {
    trackElemProps.key = t.id
  }
  return h(type, trackElemProps, content)
}
