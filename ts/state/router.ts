import { action, observable } from 'mobx'

export type MainTab = 'music' | 'guests' | 'games'
export type MusicTab = 'nowPlaying' | 'history' | 'upNext' | 'contribute'

export type MusicRoute = 'music/nowPlaying' | 'music/history' | 'music/upNext' | 'music/contribute'
export type Route = 'join' | MainTab | MusicRoute

const mainTabs = ['music', 'guests', 'games']
const musicTabs = ['nowPlaying' , 'history' , 'upNext' , 'contribute']

const main = {
  music: 'music' as MainTab,
  guests: 'guests' as MainTab,
  games: 'games' as MainTab,
}
const music = {
  nowPlaying: 'nowPlaying' as MusicTab,
  history: 'history' as MusicTab,
  upNext: 'upNext' as MusicTab,
  contribute: 'contribute' as MusicTab,
}

export default class Router {
  static mainTabs = main
  static musicTabs = music

  main: MainTab = 'music'
  music: MusicTab = 'nowPlaying'
  @observable currentRoute: Route = 'join'

  constructor() {
    // TODO: Add `hashchange` handler for external route changes
  }

  @action navigate(route: Route) {
    const routePieces = route.split('/')
    if (routePieces.length < 1) {
      return
    }

    // Music tab routing
    if (routePieces.length > 1 && routePieces[0] === main.music) {
      if (this.isMusicTab(routePieces[1]) && this.music !== routePieces[1] as MusicTab) {
        this.music = routePieces[1] as MusicTab
      }
    }

    // Main tabs routing
    if (!this.isMainTab(routePieces[0])) {
      return
    }
    if (this.main !== routePieces[0] as MainTab) {
      this.main = routePieces[0] as MainTab
    }

    window.history.replaceState(route, route, '/party#' + route)

    this.currentRoute = route
  }

  get isUpNextVisible() {
    if (this.main === 'music' && this.music === 'upNext') {
      return true
    }
    if (this.main !== 'music' || this.music === 'history' || this.music === 'contribute') {
      return false
    }

    const upNextMenuItem = document.querySelector('#upNextMenuItem') as HTMLLIElement
    // window.getComputedStyle(upNextMenuItem).display === 'none'
    return upNextMenuItem
      ? upNextMenuItem.offsetParent === null
      : false
  }

  isMainTab(tab: string) {
    return mainTabs.indexOf(tab) > -1
  }

  isMusicTab(tab: string) {
    return musicTabs.indexOf(tab) > -1
  }
}
