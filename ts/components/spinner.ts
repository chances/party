import { svg } from 'lit-html'
import { html } from 'lit-html/lib/lit-extended'

import * as util from '../util'

export class Spinner {
  pHidden?: boolean
  pColor?: string
  pSize?: number

  get hidden() {
    return this.pHidden != null
      ? this.pHidden
      : true
  }

  get color() {
    return this.pColor != null
      ? this.pColor
      : '#FCFCFC'
  }

  get size() {
    return this.pSize != null
      ? this.pSize
      : 40
  }
}

export default function render(hidden: boolean) {
  const dur = '0.7s'

  return html`<span class$="${util.klass({ spinner: true, hidden })}">
    <svg x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50">
      ${svg
        // tslint:disable-next-line:max-line-length
        `<path class="spinner" fill="#FCFCFC" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z">
          <animateTransform
            attributeName="transform"
            attributeType="xml"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="${dur}"
            repeatCount="indefinite"
          />
        </path>`
      }
    </svg>
  </span>`
}
