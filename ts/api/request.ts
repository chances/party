import Promise = require('bluebird')
import fetch = require('isomorphic-fetch')
import { Either } from 'monet'

import { Document, Error } from './data'
import * as JsonApi from './data/json-api'
import {
  ApiResponse, isErrorResponse,
  joinQueryParams, RequestParam,
  ResponsePromise,
} from './requests/primitives'
import * as p from './requests/primitives'
import Errors from './requests/primitives/errors'

Promise.config({
  cancellation: true,
})

let partyApiHost = 'https://party.chancesnow.me/'

export function setPartyApiHost(host: string) {
  partyApiHost = host.endsWith('/')
    ? host
    : host + '/'
}

export function getPartyApiHost() {
  return partyApiHost
}

const defaultOptions: RequestInit = {
  credentials: 'include',
}

export function get<T>(path: string, params?: RequestParam[]): ResponsePromise<T> {
  return request<T>('get', path, undefined, params)
}

export function post<T>(path: string, body?: JsonApi.Document,
                        params?: RequestParam[]): ResponsePromise<T> {
  return request<T>('post', path, body, params)
}

function request<T>(method: 'get' | 'post', path: string, body?: JsonApi.Document,
                    params?: RequestParam[]): ResponsePromise<T> {
  const url = partyApiHost + path +
    (params ? `?${joinQueryParams(params)}` : '')
  const headers = new Headers()
  if (body != null) {
    headers.append('Content-Type', 'application/json')
  }
  const options: RequestInit = {
    ...defaultOptions,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }

  const ok = (doc: Document<T>) => Either.Right(doc.data) as Either<Errors, p.Data<T>>
  const error = (responseStatus: number, errors: Error[]) =>
    Either.Left(new Errors(responseStatus, errors)) as Either<Errors, p.Data<T>>

  return new Promise<p.Response<T>>(resolve => {
    fetch(new Request(url, options)).then(response => {
      return isResponseEmpty(response)
        .then(
          isEmpty => isEmpty
            ? Either.Left<Response, Response>(response)
            : Either.Right<Response, Response>(response),
        )
    }).then(eitherResponse => {
      eitherResponse.cata(emptyResponse => {
        // Response was empty, resolve an error
        resolve(error(
          emptyResponse.status,
          [ Errors.requestError ],
        ))
      }, response => {
        response.json().then((data: ApiResponse<T>) => {
          if (response.ok && !isErrorResponse(data)) {
            resolve(ok(data))
          } else if (isErrorResponse(data)) {
            resolve(error(
              response.status,
              data.errors,
            ))
          } else {
            resolve(error(
              response.status,
              [ Errors.requestError ],
            ))
          }
        })
      })
    }).catch(_ => {
      resolve(error(
        p.ErrorType.NULL_ERROR,
        [ Errors.defaultError ],
      ))
    })
  })
}

function isResponseEmpty(response: Response): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const contentLengthZero = response.headers.has('Content-Length') &&
      response.headers.get('Content-Length') === '0'
    if (contentLengthZero) { resolve(true) }

    const isBodyLengthNonZero = response.clone().text()
      .then(body => body.length > 0)
    isBodyLengthNonZero.catch(error => {
      reject(error)
    })

    resolve(isBodyLengthNonZero)
  })
}
