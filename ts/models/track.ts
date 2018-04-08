import { Maybe } from 'monet'

export interface Track {
  id: string,
  name: string,
  artists: TrackArtist[],
  images: Image[],
  endpoint: string,
  began_playing: string,
  duration: number,
  contributor?: string,
  contributor_id?: string
}

export interface TrackArtist {
  id: string,
  name: string
}

export interface Image {
  width: number,
  height: number,
  url: string
}

export function firstArtistName(artists: TrackArtist[]) {
  return artists.length > 0
    ? artists[0].name
    : ''
}

export function largestImage(images: Image[]): Maybe<Image> {
  if (images == null || images.length === 0) {
    return Maybe.Nothing<Image>()
  }

  return Maybe.Just(images.reduce((largest, image) => {
    if (image.width * image.height > largest.width * largest.height) {
      return image
    } else {
      return largest
    }
  }))
}
