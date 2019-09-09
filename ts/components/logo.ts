import { html } from 'lit-html'

export default function render(isSplash: boolean, tvMode: boolean = false) {
  let header

  if (isSplash) {
    header = html`<div id="logo">
      <img src="/assets/images/party/Party-icon-72.png" alt="Party" />
      <span>Tunage</span>
    </div>`
  }

  if (tvMode) {
    header = html`
      ${header}
      <h2>Open <pre>chances.party</pre> in your browser
    `
  }

  return header
}
