import { Maybe } from 'monet'

import State from '../state'

import joinForm from '../components/join-form'

interface SplashProps {
  partyCode: Maybe<string>
  isJoining: boolean
  error: Maybe<string>
}

export default function render() {
  const {isJoining, partyCode, error} = stateProps(State)

  return joinForm({
    isJoining,
    partyCode,
    error,
  })
}

function stateProps(state: typeof State): SplashProps {
  const partyCode = state.joining
    .map(joinRequest => joinRequest.partyCode)
    .cata(() => state.partyCode, code => Maybe.Just(code))
  const isJoining = state.joining.cata(() => false, request => request.isLoading)
  const maybeError = state.joining
    .flatMap(request => request.error)
    .flatMap(err => Maybe.fromUndefined(err.detail))

  return {
    partyCode,
    isJoining,
    error: maybeError,
  }
}
