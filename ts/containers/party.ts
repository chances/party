import { html, TemplateResult } from 'lit-html'
import { Maybe } from 'monet'

import * as api from '../api'
import State from '../state'
import * as util from '../util'

import header from '../components/logo'
import nowPlaying from '../components/music/now-playing'
import splash from './splash'

export default function render() {
  return html`<main>
    ${header(State.party.isNothing(), State.tvMode)}
    ${State.party.cata(
      () => html`
        <div id="content" class$="${util.klass({ 'tv-mode': State.tvMode })}">
          ${splash()}
        </div>
        <div>
          <p>Made with love in PDX.</p>
        </div>
      `,
      party => html`
        ${party.current_track ? musicMenu() : html`<div></div>`}
        ${nowPlaying()}
        ${mainMenu()}
      `,
    )}
  </main>`
}

function musicMenu() {
  return menu('musicMenu', true, [
    menuItem('nowPlaying', 'Now Playing', true),
    menuItem('history', 'History'),
    menuItem('upNext', 'Up Next'),
    menuItem('contribute', 'Contribute'),
  ])
}

function mainMenu() {
  return menu('mainMenu', false, [
    menuItem('music', 'Music', true),
    menuItem('guests', 'Guests'),
    menuItem('games', 'Games'),
  ])
}

function menu(id: string, secondary: boolean, items: TemplateResult[]) {
  return html`<nav id=${id} class$="${util.klass({ menu: true, secondary })}">
    <ul>${items}</ul>
  </nav>`
}

function menuItem(hash: string, label: string, selected: boolean = false) {
  return html`<li id="${hash + 'MenuItem'}" class$="${util.klass({ selected })}">
    <a href="${'#' + hash}">${label}</a>
  </li>`
}
