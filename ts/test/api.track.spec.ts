import { expect, test, that } from './lib/expect'

import { firstArtistName, largestImage, Track } from '../models'

test('firstArtistName returns empty string with zero artists', _t => {
  expect(that(firstArtistName([])).equals(''))
})

const track: Track = {
  id: '',
  name: 'Awakening',
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
  contributor: 'Jake Perkins',
}

test('firstArtistName returns first artist', _t => {
  expect(that(firstArtistName(track.artists)).equals('Submotion Orchestra'))
})

test('largestImage returns nothing with zero images', _t => {
  track.images = []

  const image = largestImage(track.images)

  expect(that(image.isNothing()).is.true)
})

test('largestImage returns just the largest image', _t => {
  track.images = [
    {
      width: 750,
      height: 750,
      url: 'https://ninjatune.net/images/releases/alium-main.jpg',
    },
    {
      width: 500,
      height: 500,
      url: 'https://ninjatune.net/images/releases/alium-main.jpg',
    },
    {
      width: 1000,
      height: 1000,
      url: 'https://ninjatune.net/images/releases/alium-main.jpg',
    },
  ]

  const image = largestImage(track.images)

  expect(that(image.isJust()).is.true)
  expect(that(image.just().width).equals(1000))
  expect(that(image.just().height).equals(1000))
  expect(that(image.just().url).equals('https://ninjatune.net/images/releases/alium-main.jpg'))
})
