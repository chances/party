import {
  ErrorDocument,
  NewResource,
  Resource,
  ResourceIdentifier,
  ResourceIdentifierDocument,
} from '.'
import * as util from '../../util'
import * as JsonApi from './json-api'

// JSON API Specification - Document Structure
// http://jsonapi.org/format/1.0/#document-structure
//
// tslint:disable-next-line:max-line-length
export default class Document<T> implements JsonApi.Document {
  meta?: {} = undefined

  constructor(public data: Resource<T> | NewResource<T>) {}

  static ResourceIdentifier(id: string, type: Type) {
    return new ResourceIdentifierDocument(new ResourceIdentifier(id, typeName(type)))
  }

  static Resource<T>(id: string, type: Type, data: T) {
    return new Document<T>(new Resource<T>(id, typeName(type), data))
  }

  static NewResource<T>(type: Type, data: T) {
    return new Document<T>(new NewResource<T>(typeName(type), data))
  }

  static Error(error: JsonApi.Error) {
    return new ErrorDocument(error)
  }

  static Errors(errors: JsonApi.Error[]) {
    return new ErrorDocument(errors)
  }
}

type Constructor = new (...args: any[]) => any
type Type = Constructor | string

function typeName(constructorOrTypeName: Type) {
  const name = typeof constructorOrTypeName === 'string'
    ? constructorOrTypeName
    : constructorOrTypeName.name

  return util.toKebabCase(name)
}
