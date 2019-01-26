import { html } from 'lit-html'
import { Maybe } from 'monet'

import State from '../state'
import * as util from '../util'

import spinner from './spinner'

interface Props {
  partyCode: Maybe<string>
  isJoining: boolean
  error: Maybe<string>
}

export default function render(props: Props) {
  const isSubmitHiding = props.isJoining || props.partyCode.cata(
    () => true,
    currentPartyCode => currentPartyCode.length === 0,
  )
  props.partyCode.map(code => partyCode = code)

  return html`<form id="join" @submit=${onJoinSubmitted}>
    <h1>Join a Party</h1>
    <p>Help mix things up and join the fun!</p>
    <div class="form-group">
      <label for="partyCode">Party code:</label>
      <div class="pill-group">
        <input
          id="partyCode"
          type="text"
          value=${props.partyCode.orJust('')}
          placeholder="Ab7j"
          autofocus=${true} autocomplete="off"
          maxLength="4" ?disabled=${props.isJoining}
          @input=${partyCodeInputChange}
          @focus=${focusBlurJoinForm}
          @blur=${focusBlurJoinForm} />
        <input
          class="${util.klass({ hiding: isSubmitHiding })}"
          type="submit" value="Join" title="Join the party"
          @focus=${focusBlurJoinForm}
          @blur=${focusBlurJoinForm} />
      </div>
      ${spinner(!props.isJoining)}
    </div>
    ${props.error.isJust() // Error message
      ? html`<p class="error">${props.error.just()}</p>`
      : html`<p></p>`}
  </form>`
}

let partyCode = ''
function partyCodeInputChange(e: Event) {
  const partyCodeInput = e.currentTarget as HTMLInputElement
  const submit = partyCodeInput.nextElementSibling as HTMLInputElement
  const value = stripNonAlphaNumeric(
    partyCodeInput.value.trim().toUpperCase().replace(whitespace, ''),
  )
  partyCodeInput.value = value
  partyCode = value

  const submitVisible = value.length > 0

  if (submitVisible) {
    submit.classList.remove('hiding')
  } else {
    submit.classList.add('hiding')
  }
}

const whitespace = /[\s\\\^\[\]`]/g
const alphaNum = /[a-zA-z0-9]/
function stripNonAlphaNumeric(s: string) {
  let result = ''
  for (let char = 0; char < s.length; char++) {
    const c = s.charAt(char)
    result += alphaNum.test(c) ? c : ''
  }
  return result
}

function focusBlurJoinForm(e: Event) {
  const joinInput = e.currentTarget as HTMLInputElement
  const pillGroup = joinInput.parentElement as HTMLElement

  if (e.type === 'focus') {
    pillGroup.classList.add('focus')
  } else {
    pillGroup.classList.remove('focus')
  }
}

function onJoinSubmitted(e: Event) {
  e.preventDefault()

  if (partyCode && partyCode.trim()) {
    const joinForm = e.currentTarget as HTMLFormElement
    joinForm.blur()

    State.joinParty(partyCode)
  }
}
