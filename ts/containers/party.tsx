import { Maybe } from 'monet'
import * as Snabbdom from 'snabbdom-pragma'

import * as api from '../api'
import State from '../state'

import header from '../components/logo'
import NowPlaying from '../components/now-playing'
import Splash from './splash'

/* tslint:disable:jsx-key */
export class Party {

  render() {
    return Snabbdom.createElement('main', {}, header(State.party.isNothing(), State.tvMode).concat(
      State.party.cata(
        () => [
          <div id="content">
            { Splash.render() }
          </div>,
          <div>
            <p>Made with love in PDX.</p>
          </div>,
        ],
        _ => [
          musicMenu(),
          NowPlaying.render(),
          mainMenu(),
        ],
      ),
    ))
  }
}

const party = new Party()
export default party

function musicMenu() {
  return menu('musicMenu', true, [
    <li class={{selected: true}}><a href="#nowPlaying">Now Playing</a></li>,
    <li><a href="#history">History</a></li>,
    <li id="upNextMenuItem"><a href="#upNext">Up Next</a></li>,
    <li><a href="#contribute">Contribute</a></li>,
  ])
}

function mainMenu() {
  return menu('mainMenu', false, [
    <li><a href="#games">Games</a></li>,
    <li class={{selected: true}}><a href="#music">Music</a></li>,
    <li><a href="#guests">Guests</a></li>,
  ])
}

function menu(id: string, secondary: boolean, items: JSX.Element[]) {
  return <nav id={id} class={{ menu: true, secondary }} >
    <ul>
      { items }
    </ul>
  </nav>
}
