export interface Metadata {
  meta?: {}
}

export interface NewResourceIdentifier extends Metadata {
  type: string
}

export interface NewResource extends NewResourceIdentifier {
  attributes?: {}
}

export interface ResourceIdentifier extends NewResourceIdentifier {
  id: string
}

export interface Resource extends ResourceIdentifier {
  attributes?: {}
  links?: {
    self: string,
  }
}

export interface Document extends Metadata {
  data: NewResourceIdentifier | ResourceIdentifier
}

// JSON API Specification - Errors
// http://jsonapi.org/format/1.0/#errors
export interface Error {
  id?: string
  status?: number | string
  code?: string
  title?: string
  detail?: string
  meta?: {} | {
    cause: string | null,
    details: string | null,
  }
}

export interface ErrorDocument extends Metadata {
  errors: Error[]
}
