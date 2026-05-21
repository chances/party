import * as process from "node:process";

export default function _curry(f: (...args: any[]) => any) {
  return (...args: any[]) => {
    return args.length < f.length
      ? _curry(
        args.reduce(
          (g: () => any, arg: any) => {
          return g.bind<null, typeof arg, any[], unknown>(null, arg)
        }, f),
      )
      : f.apply(null, args)
  }
}

declare global {
  // const process:
  interface Process {
    env: {
      NODE_ENV: string
    }
  }
}

export const log = _curry((message: string, value: any) => {
  if (process.env.NODE_ENV === 'development') {
    // tslint:disable-next-line:no-console
    console.log(message, value)
  }
  return value
})

export function isPromise(thenable: PromiseLike<any> | any | void): thenable is Promise<any> {
  return thenable !== undefined
    ? typeof thenable.then === 'function'
    : false
}

export function toKebabCase(input: string) {
  return input.trim().split(/(?=[A-Z])/).join('-').toLowerCase()
}

export interface ParamMap {[index: string]: string}
function getParams(query: string): ParamMap {
  if (!query) {
    return { }
  }

  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .filter(pair => pair.trim().length > 0)
    .reduce((params: ParamMap, param) => {
      const [ key, value ] = param.split('=')
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : ''
      return params
    }, { })
}

export function queryParams(): ParamMap {
  const params = getParams(globalThis.location.search)
  return log('Query params: ', params)
}

interface ClassObject {
  [name: string]: boolean
}

export function klass(classes: ClassObject) {
  const filteredClasses: string[] = []
  for (const name in classes) {
    if (classes[name]) {
      filteredClasses.push(name)
    }
  }
  return filteredClasses.length ? filteredClasses.join(' ') : ''
}
