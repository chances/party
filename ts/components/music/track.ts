import { TemplateResult } from 'lit-html'
import { html } from 'lit-html/lib/lit-extended'

import * as models from '../../models'
import { firstArtistName, largestImage } from '../../models'

export function listItem(t: models.Track) {
  return track('li', t)
}

export function block(id: string, name: string, t: models.Track) {
  const heading = html`<h2>${name}</h2>`
  return track('div', t, id, heading)
}

// tslint:disable-next-line:max-line-length
export default function track(type: 'div' | 'li', t: models.Track, id?: string, heading?: TemplateResult) {
  const {images, name, artists, contributor} = t
  const image = largestImage(images)

  const requestedBy = contributor
      ? html`<span class="requested-by">Added by ${contributor}</span>`
      : html`<span></span>`

  let content = html`<div class="song-info">
    <span class="title">${name}</span>
    <span class="artist">${firstArtistName(artists)}</span>
    ${requestedBy}
  </div>`

  if (image.isJust()) {
    content = html`
      <img src=${image.just().url} />
      ${content}
    `
  }

  if (heading) {
    content = html`
      ${heading}
      ${content}
    `
  }

  return type === 'li'
    ? html`<li id=${id ? id : ''} class="track">${content}</li>`
    : html`<div id=${id ? id : ''} class="track">${content}</div>`
}
