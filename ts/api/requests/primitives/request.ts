import Promise = require('bluebird')
import { Either, Maybe } from 'monet'

import { Data, isResource, Response } from '.'
import * as util from '../../../util'
import { ResourceIdentifier } from '../../data'
import Errors from './errors'
import { Error, nullErrorToNothing } from './errors'

// tslint:disable-next-line:max-line-length
function isResponsePromise<T>(thenable: PromiseLike<any> | Response<T>): thenable is Promise<Response<T>> {
  return util.isPromise(thenable)
}

export default class Request<T> {
  private responsePromise: Promise<Response<T>>
  response: Maybe<Response<T>>

  constructor() {
    this.response = Maybe.Nothing()
    this.responsePromise = new Promise(_ => {
      // noop
    })
  }

  static fromResponse<T>(responseOrResponsePromise: Response<T> | Promise<Response<T>>) {
    const request = new Request<T>()

    if (isResponsePromise(responseOrResponsePromise)) {
      const responsePromise = responseOrResponsePromise

      request.responsePromise = responsePromise.then(response => {
        request.response = Maybe.Just(response)
        return request.response.just()
      }).catch(_ => {
        const response = Either.Left<Errors, Data<T>>(Errors.fromError(Errors.requestError))
        request.response = Maybe.Just(response)
        return request.response.just()
      })
    } else {
      request.response = Maybe.Just(responseOrResponsePromise)
      request.responsePromise = Promise.resolve(request.response.just())
    }

    return request
  }

  get isLoading(): boolean {
    return this.response.isNothing()
  }

  get isCompleted(): boolean {
    return this.response.isJust()
  }

  get promise() {
    return this.responsePromise
  }

  get isResourceId() {
    return this.isCompleted && this.responseData.isNothing()
  }

  get isErrored(): boolean {
    return this.isCompleted && this.error.isJust()
  }

  get error(): Maybe<Error> {
    return this.response
      .map(eitherResponse => {
        return eitherResponse.cata<Error>(errorResponse => {
          return errorResponse.errors
            .filter(error => error.status === errorResponse.responseStatus)[0] ||
            errorResponse.errors[errorResponse.errors.length - 1] ||
            Errors.defaultError
        }, _response => Errors.nullError)
      })
      .flatMap(nullErrorToNothing)
  }

  get resourceId(): Maybe<ResourceIdentifier> {
    return this.response
      .flatMap(eitherData => eitherData.toMaybe()
        .map(data => new ResourceIdentifier(data.id, data.type)))
  }

  get responseData(): Maybe<T> {
    return this.response
      .flatMap(eitherData => {
        return eitherData.toMaybe().flatMap(data => {
          return isResource(data)
            ? Maybe.Just<T>(data.attributes)
            : Maybe.Nothing()
        })
      })
  }

  send(): void {
    // noop
  }
}
