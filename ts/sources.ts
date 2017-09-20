import { MainDOMSource } from '@cycle/dom'

declare type Sources = DomSource
export default Sources

export interface DomSource {
  DOM: MainDOMSource
}
