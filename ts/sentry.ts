import * as Raven from 'raven-js'

import Errors from './api/request/errors'

let raven: Raven.RavenStatic

if (process.env.NODE_ENV === 'production') {
  raven = Raven.config('https://530e15393a054076a940d232421663bb@sentry.io/1100570').install()
}

export function reportErrors(funcOrErrors: Function | Errors) {
  if (raven != null && typeof funcOrErrors === 'function') {
    raven.context(funcOrErrors)
  } else if (typeof funcOrErrors === 'function') {
    funcOrErrors()
  } else {
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
  }
}

export function setUserContext(context?: any) {
  if (raven != null) {
    raven.setUserContext(context)
  }
}

export function captureBreadcrumb(category: string, data?: any) {
  if (raven != null) {
    raven.captureBreadcrumb({
      category,
      level: 'debug',
      data,
    })
  }
}
