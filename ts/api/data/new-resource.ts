import * as JsonApi from './json-api'

export default class NewResource<T> implements JsonApi.NewResource {
  attributes?: T

  constructor(public type: string, data: T) {
    this.attributes = data
  }
}
