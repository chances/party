import * as Sentry from "@sentry/deno";

import Errors from "../supabase/api/requests/primitives/errors";

Sentry.init({
  dsn: "https://7420859a1d7b4750b367b23797690f6c@o72304.ingest.us.sentry.io/155373",
});

export function reportErrors(funcOrErrors: Function | Errors) {
  if (typeof funcOrErrors === "function") {
    Sentry.setContext(funcOrErrors());
  } else {
    // Map the Errors instance to a JS Error with Sentry extra metadata
    funcOrErrors.errors.forEach(err => {
      Sentry.captureException(new Error(err.title), {
        extra: {
          responseStatus: funcOrErrors.responseStatus,
          type: funcOrErrors.type,
          detail: err.detail,
          meta: err.meta,
        },
      });
    });
  }
}

export function setUserContext(context?: any) {
  Sentry.setUser(context);
}

export function captureBreadcrumb(category: string, data?: any) {
  Sentry.addBreadcrumb({
    category,
    level: "debug",
    data,
  });
}

export function captureException(err: string | Error, extra?: any) {
  Sentry.captureException(err, {
    extra,
  });
}
