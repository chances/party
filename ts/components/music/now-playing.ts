import { html } from 'lit-html/lib/lit-extended'
import { Maybe } from 'monet'

import { Party, Track } from '../../models'
import State from '../../state'
import * as util from '../../util'

import currentTrack from './current-track'
import trackList from './track-list'

export default function render() {
  const tvMode = State.tvMode
  const party = State.party.just()
  const maybeTrack = Maybe.fromNull<Track>(party.current_track)
  const maybeQueue = State.queue.map(queue => queue.slice(0, 5))

  return content(party, maybeTrack, maybeQueue)
}

function content(party: Party, maybeTrack: Maybe<Track>, maybeQueue: Maybe<Track[]>) {
  return html`<div id="content" class$="${util.klass({ placeholder: maybeTrack.isNothing() })}">
    ${maybeTrack.cata(
      () => html`
        <h1>Where's the music?</h1>
        <p>${party.location.host_name} isn't playing any music right now.</p>
        <p>Ask them to play something.</p>
      `,
      track => html`
        ${currentTrack(track)}
        ${trackList('upNext', 'Up Next', maybeQueue.cata(() => [], tracks => tracks))}
      `,
    )}
  </div>`
}
