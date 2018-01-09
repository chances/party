
export default function _curry(f: (...args: any[]) => any) {
  return (...args: any[]) => {
    return args.length < f.length
      ? _curry(
        args.reduce(
        (g: () => any, arg: any) => {
          return g.bind(null, arg)
        }, f),
      )
      : f.apply(null, args)
  }
}

export const log = _curry((message: string, value: any) => {
  if (process.env.NODE_ENV === 'development') {
    // tslint:disable-next-line:no-console
    console.log(message, value)
  }
  return value
})

interface ClassObject {
  [name: string]: boolean
}

export interface ParamMap {[index: string]: string}
function getParams(query: string): ParamMap {
  if (!query) {
    return { }
  }

  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params: ParamMap, param) => {
      const [ key, value ] = param.split('=')
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : ''
      return params
    }, { })
}

export function queryParams(): ParamMap {
  const params = getParams(window.location.search)
  return log('Query params: ', params)
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
