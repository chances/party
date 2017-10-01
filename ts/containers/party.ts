import { Maybe } from 'monet'
import { a, div, h, li, main, nav, p, ul, VNode } from 'mostly-dom'

import * as api from '../api'
import State from '../state'
import * as util from '../util'

import header from '../components/logo'
import nowPlaying from '../components/now-playing'
import splash from './splash'

export default function render() {
  return main(header(State.party.isNothing(), State.tvMode).concat(
    State.party.cata(
      () => [
        div({ attrs: { id: 'content' } }, [ splash() ]),
        div([
          p('Made with love in PDX.'),
        ]),
      ],
      _ => [
        musicMenu(),
        nowPlaying(),
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
  return nav({ key: id, attrs: { id }, class: util.klass({ menu: true, secondary }) }, [
    ul(items),
  ])
}

function menuItem(hash: string, label: string, selected: boolean = false) {
  return li({ attrs: { id: hash + 'MenuItem' }, class: util.klass({ selected }) }, [
    a({ attrs: { href: '#' + hash } }, label),
  ])
}
