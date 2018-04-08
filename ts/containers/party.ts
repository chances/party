import { html, TemplateResult } from 'lit-html'

import { Party } from '../models/party'
import State, { Route } from '../state'
import Menu from '../state/menu'
import * as util from '../util'

import header from '../components/logo'
import history from '../components/music/history'
import nowPlaying from '../components/music/now-playing'
import splash from './splash'

export default function render() {
  return html`<main>
    ${header(State.party.isNothing(), State.tvMode)}
    ${State.party.cata(renderSplash, renderParty)}
  </main>`
}

function renderSplash() {
  return html`
    <div id="content" class$="${util.klass({ 'tv-mode': State.tvMode })}">
      ${splash()}
    </div>
    <div>
      <p>Made with love in PDX.</p>
    </div>
  `
}

function renderParty(party: Party) {
  let content

  if (State.menu.main === Menu.mainTabs.music) {
    switch (State.menu.music) {
      case Menu.musicTabs.nowPlaying:
        content = nowPlaying()
        break

      case Menu.musicTabs.history:
        content = history()
        break

      default:
        content = html`
          <div id="content" class="placeholder">
            <h1>Not Found</h1>
            <p>Please <a href="/party">reload</a> the party.</p>
          </div>
        `
        break
    }

    content = html`
      ${party.current_track ? musicMenu() : html`<div></div>`}
      ${content}
    `
  }

  content = html`
    ${content}
    ${mainMenu()}
  `
  return content
}

function musicMenu() {
  return menu('musicMenu', true, [
    menuItem('music/nowPlaying', 'Now Playing', State.menu.music === Menu.musicTabs.nowPlaying),
    menuItem('music/history', 'History', State.menu.music === Menu.musicTabs.history),
    menuItem('music/upNext', 'Up Next', State.menu.music === Menu.musicTabs.upNext),
    menuItem('music/contribute', 'Contribute', State.menu.music === Menu.musicTabs.contribute),
  ])
}

function mainMenu() {
  return menu('mainMenu', false, [
    menuItem('music', 'Music', State.menu.main === Menu.mainTabs.music),
    menuItem('guests', 'Guests', State.menu.main === Menu.mainTabs.guests),
    menuItem('games', 'Games', State.menu.main === Menu.mainTabs.games),
  ])
}

function menu(id: string, secondary: boolean, items: TemplateResult[]) {
  return html`<nav id=${id} class$="${util.klass({ menu: true, secondary })}">
    <ul>${items}</ul>
  </nav>`
}

function menuItem(hash: string, label: string, selected: boolean = false) {
  const hashSegments = hash.split('/')
  const id = hashSegments[hashSegments.length - 1]
  return html`<li id="${id + 'MenuItem'}" class$="${util.klass({ selected })}" data-for$="${id}">
    <a href="${'#' + hash}" on-click=${menuItemClick}>${label}</a>
  </li>`
}

function menuItemClick(e: MouseEvent) {
  e.preventDefault()

  const target = e.target as HTMLAnchorElement
  State.menu.navigate(target.hash.replace('#', '') as Route)
}
