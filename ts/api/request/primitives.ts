import Promise = require('bluebird')
import { Either, Maybe } from 'monet'

import { Document, Resource, ResourceIdentifier } from '../data'
import * as JsonApi from '../data/resources'
import Errors from './errors'
import { Error, nullErrorToNothing } from './errors'

export interface RequestParam {name: string, value: string}
export class Request<T> {
  response: Maybe<Response<T>>

  constructor(response?: Response<T>) {
    this.response = Maybe.fromNull(response)
  }

  get isLoading(): boolean {
    return this.response.isNothing()
  }

  get isCompleted(): boolean {
    return this.response.isJust()
  }

  get isErrored(): boolean {
    return this.isCompleted && this.error.isJust()
  }

  get error(): Maybe<Error> {
    return this.response
    .map(eitherResponse => {
      return eitherResponse.cata<Error>(
        errorResponse => {
          return errorResponse.errors
            .filter(error => error.status === errorResponse.responseStatus)[0] ||
            errorResponse.errors[errorResponse.errors.length - 1] ||
            Errors.defaultError
        },
        _response => Errors.nullError,
      )
    })
    .flatMap(nullErrorToNothing)
  }

  get result(): Maybe<T> {
    return this.response.flatMap(eitherData => eitherData.toMaybe().map(data => data.attributes))
  }
}

export type ApiResponse<T> = Document<T> | JsonApi.ErrorDocument
export type Data<T> = Resource<T> | ResourceIdentifier

export function isResource<T>(data: Data<T>): data is Resource<T>
export function isResource(data: any): data is JsonApi.Resource {
  return data.attributes !== undefined && typeof data.attributes === 'object'
}

export function isErrorResponse<T>(response: ApiResponse<T>): response is JsonApi.ErrorDocument {
  return (response as JsonApi.ErrorDocument).errors !== undefined &&
    Array.isArray((response as JsonApi.ErrorDocument).errors)
}

export type Response<T> = Either<Errors, Data<T>>
export type ResponsePromise<T> = Promise<Response<T>>

export function joinParams(params: RequestParam[]): string {
  return params.map(param => {
    return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value)
  }).join('&')
}
