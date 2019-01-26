import Promise = require('bluebird')
import fetch = require('isomorphic-fetch')
import { Either } from 'monet'

import Errors from './request/errors'
import { Error, ErrorType } from './request/errors'
import { ApiResponse, joinParams, RequestParam, ResponsePromise } from './request/primitives'
import * as p from './request/primitives'

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

export function post<T>(path: string, body?: {data: any},
                        params?: RequestParam[]): ResponsePromise<T> {
  return request<T>('post', path, body, params)
}

function request<T>(method: 'get' | 'post', path: string, body?: {data: any},
                    params?: RequestParam[]): ResponsePromise<T> {
  const url = partyApiHost + path +
    (params ? `?${joinParams(params)}` : '')
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

  const ok = (data: p.DataResponse<T>) => Either.Right(data.data) as Either<Errors, p.Data<T>>
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
        ErrorType.NULL_ERROR,
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

function isErrorResponse<T>(responseData: ApiResponse<T>): responseData is p.ErrorResponse {
  return (responseData as p.ErrorResponse).errors !== undefined
}
