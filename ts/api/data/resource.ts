import * as JsonApi from './json-api'
import NewResource from './new-resource'

export default class Resource<T> extends NewResource<T> implements JsonApi.Resource {
  attributes!: T

  constructor(public id: string, type: string, data: T) {
    super(type, data)
  }
}
