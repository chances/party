import { div, form, h1, input, label, p } from '@cycle/dom'
import { Maybe } from 'monet'
import xs from 'xstream'
// import xs from 'xstream'

import { DomSource } from '../sources'

import header from './logo'
import Spinner from './spinner'

interface Props {
  partyCode: Maybe<string>
  isJoining: boolean
  error: Maybe<string>
  onJoinSubmitted(partyCode: string): void
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

export default function joinForm(sources: DomSource) {
  const partyCodeInputChange$ = sources.DOM.select('#partyCode')
    .events('input')
    .map(partyCodeInputChange)
    .startWith('')

  // const isSubmitHiding = props.isJoining || props.partyCode.cata(
  //   () => true,
  //   partyCode => partyCode.length === 0,
  // )

  // props.partyCode.cata(() => '', partyCode => partyCode)

  const focusJoinForm$ = sources.DOM.select('#partyCode input')
    .events('focus').map(focusBlurJoinForm)
  const blurJoinForm$ = sources.DOM.select('#partyCode input')
    .events('blur').map(focusBlurJoinForm)
  const formIsFocused$ = xs.merge(focusJoinForm$, blurJoinForm$)

  return xs.combine(partyCodeInputChange$, formIsFocused$)
    .map(([partyCode, formIsFocused]) => form('#join', [
      h1('Join a Party'),
      p('Help mix things up and join the fun!'),
      div('.form-group', [
        label({ attrs: { for: 'partyCode' } }, 'Party code:'),
        div('.pill-group', { class: { focus: formIsFocused } }, [
          input('#partyCode', { attrs: {
            type: 'text',
            // value: partyCode,
            placeholder: 'Ab7j',
            autofocus: true,
            autocomplete: 'off',
            maxLength: 4,
            // disabled: props.isJoining,
          }}),
          input({ class: { hiding: partyCode.length === 0 }, attrs: {
            type: 'submit',
            value: 'Join',
            title: 'Join the party',
          }}),
        ]),
        // new Spinner(!props.isJoining).render(),
      ]),
      // p('.error', props.error.cata(() => '', errStr => errStr)),
    ]))
}

function partyCodeInputChange(e: Event) {
  const input = e.currentTarget as HTMLInputElement
  const value = stripNonAlphaNumeric(
    input.value.trim().replace(whitespace, ''),
  )
  input.value = value

  return value
}

function focusBlurJoinForm(e: Event) {
  return e.type === 'focus'
}

// function onJoinSubmitted(e: Event) {
//   e.preventDefault()

//   if (this.partyCode && this.partyCode.value && this.partyCode.value.trim()) {
//     this.partyCode.blur()
//     this.submitButton.blur()

//     this.props.onJoinSubmitted(this.partyCode.value)
//   }
// }
