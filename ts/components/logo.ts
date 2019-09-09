import { html } from 'lit-html'

export default function render(tvMode: boolean = false) {
  const flexSpacer = html`<span style="flex: 1"></span>`
  const tvModeBanner = html`
    ${flexSpacer}
    <h2>Open <pre>tunage.app</pre> in your browser</h2>
    ${flexSpacer}
  `

  return html`<div id="logo">
      <img src="/assets/images/party/Party-icon-72.png" alt="Party" />
      <span>Tunage</span>
      ${tvMode ? tvModeBanner : null}
    </div>`
}
