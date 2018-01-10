import { html } from 'lit-html/lib/lit-extended'
import { Maybe } from 'monet'

import { Party, Track } from '../../models'
import State from '../../state'
import * as util from '../../util'

import trackList from './track-list'

export default function render() {
  const tvMode = State.tvMode
  const party = State.party.just()
  const maybeHistory = State.history.map(history => history.slice(0, 15))

  return content(party, maybeHistory)
}

function content(party: Party, maybeHistory: Maybe<Track[]>) {
  const noHistory = maybeHistory.isNothing() || maybeHistory.just().length === 0

  return html`<div id="content" class$="${util.klass({ placeholder: noHistory })}">
    ${noHistory ? html`
      <h1>Where's the music?</h1>
      <p>${party.location.host_name}'s party is just beginning.</p>
      <p>See what's <a href="#music/nowPlaying">playing now</a>.</p>
    ` : html`
      ${trackList('history', '', maybeHistory.just())}
    `}
  </div>`
}
