import * as JsonApi from './json-api'

// tslint:disable-next-line:max-line-length
export default class ResourceIdentifier implements JsonApi.ResourceIdentifier {
  constructor(public id: string, public type: string) {}
}
