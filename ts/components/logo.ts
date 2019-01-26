import { html } from 'lit-html'

export default function render(isSplash: boolean, tvMode: boolean = false) {
  let header

  if (isSplash) {
    header = html`<div id="logo">
      <img src="/assets/images/party/Party-icon-152.png" alt="Party" />
      <p style="margin-top: 0;">Prototype</p>
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
