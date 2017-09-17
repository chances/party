import * as Snabbdom from 'snabbdom/h'

export default function header(isSplash: boolean, tvMode: boolean = false) {
  const header = []

  if (isSplash) {
    header.push(
      <div attrs={{ id: 'logo' }} >
        <img
          src="/assets/images/party/Party-logo-invert.png"
          alt="Party"
        />
        <p style={{ 'margin-top': '0' }}>Prototype</p>
      </div>,
    )
  }

  if (tvMode) {
    header.push(
      <h2>Open <pre>chances.party</pre> in your browser</h2>,
    )
  }

  return header
}
