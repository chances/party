import * as JsonApi from './json-api'

export default class ErrorDocument implements JsonApi.ErrorDocument {
  errors: JsonApi.Error[]
  meta?: {} = undefined

  constructor(error: JsonApi.Error);
  // tslint:disable-next-line:unified-signatures
  constructor(errors: JsonApi.Error[]);
  constructor(errorOrErrors: JsonApi.Error | JsonApi.Error[]) {
    this.errors = Array.isArray(errorOrErrors) ? errorOrErrors : [ errorOrErrors ]
  }
}
