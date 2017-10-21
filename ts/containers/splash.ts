import { Maybe } from 'monet'

import { Request } from '../api'
import { JoinParty } from '../models'
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
  const isJoining = state.joining.cata(() => false, request => request.isLoading)
  const maybeError = state.joining
    .flatMap(request => request.error)
    .map(err => err.detail)

  return {
    partyCode: state.joining.map(joinRequest => joinRequest.partyCode),
    isJoining,
    error: maybeError,
  }
}
