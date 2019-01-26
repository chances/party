import { Maybe } from 'monet'

import { PartyError } from './party-error'

export { PartyError } from './party-error'

export enum ErrorType {
  UNKNOWN_ERROR,
  NULL_ERROR,
  ERROR,
}

const defaultError = createError(
  'Request Error', 'Could not complete the request. Please check your internet connection.',
)
const nullError: Error = {
  ...defaultError,
  status: ErrorType.NULL_ERROR,
}

export interface Error {
  status: number
  title: string
  detail: string
  meta: {
    cause: string | null,
    details: string | null,
  }
}

export default class Errors {
  static create = createError
  static defaultError = defaultError
  static nullError = nullError

  constructor(public responseStatus: ErrorType | number, public errors: Error[]) {}

  get isRequestError() {
    return this.responseStatus === 1
  }

  get isBadRequest() {
    return this.responseStatus === 400
  }

  get isUnauthorized() {
    return this.responseStatus === 401
  }

  get isNotFound() {
    return this.responseStatus === 404
  }

  get type() {
    switch (this.responseStatus) {
      case 1: return 'request-error'
      case 400: return 'bad-request'
      case 401: return 'unauthorized'
      case 404: return 'not-found'
      default: return 'error'
    }
  }

  toError() {
    return new PartyError(this)
  }
}

export function nullErrorToNothing(err: Error): Maybe<Error> {
  return err.status !== ErrorType.NULL_ERROR
    ? Maybe.Just(err)
    : Maybe.Nothing<Error>()
}

function createError(title: string, detail: string, cause?: string, details?: string): Error {
  return {
    status: -1,
    title,
    detail,
    meta: {
      cause: cause ? cause : null,
      details: details ? details : null,
    },
  }
}
