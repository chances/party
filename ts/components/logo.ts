import { div, h, h2, img, p, pre, VNode } from 'mostly-dom'

export default function header(isSplash: boolean, tvMode: boolean = false) {
  const header: VNode[] = []

  if (isSplash) {
    header.push(
      div({ attrs: { id: 'logo' } }, [
        img({ attrs: { src: '/assets/images/party/Party-logo-invert.png', alt: 'Party' } }),
        p({ style: { marginTop: 0 } }, 'Prototype'),
      ]),
    )
  }

  if (tvMode) {
    header.push(
      h2(['Open ', pre('chances.party'), ' in your browser']),
    )
  }

  return header
}
