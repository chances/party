import { ResourceIdentifier } from '.'
import * as JsonApi from './json-api'

export default class ResourceIdentifierDocument implements JsonApi.Document {
  meta?: {} = undefined

  constructor(public data: ResourceIdentifier) {}
}
