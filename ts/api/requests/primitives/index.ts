import Promise = require('bluebird')
import { Either } from 'monet'

import { Document, Resource, ResourceIdentifier } from '../../data'
import * as JsonApi from '../../data/json-api'
import Errors from './errors'

export { ErrorType } from './errors'

export { default as Request } from './request'

export interface RequestParam {name: string, value: string}
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

export function joinQueryParams(params: RequestParam[]): string {
  return params.map(param => {
    return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value)
  }).join('&')
}
