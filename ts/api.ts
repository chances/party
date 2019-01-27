import * as errors from './api/request/errors'

export { setPartyApiHost, get, post } from './api/request'
export {
  isResource,
  Response, ResponsePromise,
  Request, RequestParam,
} from './api/request/primitives'
export const Errors = errors.default
