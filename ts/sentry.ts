import { Maybe } from 'monet'
import * as Raven from 'raven-js'

import Errors from './api/requests/primitives/errors'

let maybeRaven: Maybe<Raven.RavenStatic> = Maybe.Nothing()

if (process.env.NODE_ENV === 'production') {
  maybeRaven = Maybe.Just(
    Raven.config('https://530e15393a054076a940d232421663bb@sentry.io/1100570').install(),
  )
}

export function reportErrors(funcOrErrors: Function | Errors) {
  if (typeof funcOrErrors === 'function') {
    maybeRaven.cata(
      () => funcOrErrors(),
      raven => raven.context(funcOrErrors),
    )
  } else {
    maybeRaven.forEach(raven => {
      // Map the Errors instance to a JS Error with Sentry extra metadata
      funcOrErrors.errors.forEach(err => {
        raven.captureException(new Error(err.title), {
          extra: {
            responseStatus: funcOrErrors.responseStatus,
            type: funcOrErrors.type,
            detail: err.detail,
            meta: err.meta,
          },
        })
      })
    })
  }
}

export function setUserContext(context?: any) {
  maybeRaven.map(raven => raven.setUserContext(context))
}

export function captureBreadcrumb(category: string, data?: any) {
  maybeRaven.map(raven => raven.captureBreadcrumb({
    category,
    level: 'debug',
    data,
  }))
}
