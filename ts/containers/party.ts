import { a, div, li, nav, p, ul, VNode } from '@cycle/dom'
import { Maybe } from 'monet'
import xs from 'xstream'

import * as api from '../api'
import { DomSource } from '../sources'
import State from '../state'

import header from '../components/logo'
import NowPlaying from '../components/now-playing'
import splash from './splash'

export default function party(sources: DomSource) {
  // TODO: This is wrong, won't ever render the party view
  return splash(sources)
    .map(splashView => header(State.party.isNothing(), State.tvMode).concat(
      State.party.cata(
        () => [
          div('#content', [ splashView ]),
          div([ p('Made with love in PDX.') ]),
        ],
        _ => [
          musicMenu(),
          NowPlaying.render(),
          mainMenu(),
        ],
      ),
    ))
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
    menuItem('games', 'Games'),
    menuItem('music', 'Music', true),
    menuItem('guests', 'Guests'),
  ])
}

function menu(id: string, secondary: boolean, items: VNode[]) {
  return nav({
    id, class: { menu: true, secondary },
  }, [ ul(items) ])
}

function menuItem(hash: string, label: string, selected: boolean = false) {
  return li({ key: hash, class: { selected } }, [
    a({ attrs: { href: '#' + hash } }, label),
  ])
}
