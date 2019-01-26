import { html } from 'lit-html'
import { Maybe } from 'monet'

import { Track } from '../../models'
import State from '../../state'
import * as util from '../../util'

import currentTrack from './current-track'
import trackList from './track-list'

export default function render() {
  const party = State.party.just()
  const maybeTrack = Maybe.fromNull<Track>(party.current_track)
  const maybeQueue = State.queue.map(queue => queue.slice(0, 3))

  return html`<div id="content" class$="${util.klass({
    'tv-mode': State.tvMode,
    placeholder: maybeTrack.isNothing(),
  })}">
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
