import { html } from 'lit-html'

import State from '../../state'
import * as util from '../../util'

import trackList from './track-list'

export default function render() {
  const party = State.party.just()
  const maybeHistory = State.history.map(history => history.slice(0, 15))

  const noHistory = maybeHistory.isNothing() || maybeHistory.just().length === 0

  return html`<div id="content" class$="${util.klass({
    'tv-mode': State.tvMode,
    placeholder: noHistory,
  })}">
    ${noHistory ? html`
      <h1>Where's the music?</h1>
      <p>${party.location.host_name}'s party is just beginning.</p>
      <p>See what's <a href="#music/nowPlaying">playing now</a>.</p>
    ` : html`
      ${trackList('history', '', maybeHistory.just())}
    `}
  </div>`
}
