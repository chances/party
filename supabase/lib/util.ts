export default function _curry(f: (...args: any[]) => any) {
  return (...args: any[]) => {
    return args.length < f.length
      ? _curry(
        args.reduce(
          (g: () => any, arg: any) => {
          return g.bind<null, typeof arg, any[], unknown>(null, arg);
        }, f),
      )
      : f.apply(null, args);
  };
}

export const log = _curry((message: string, value: any) => {
  // deno-lint-ignore no-process-global
  if (process.env.NODE_ENV === "development") {
    // tslint:disable-next-line:no-console
    console.log(message, value);
  }
  return value;
});

export function isPromise(thenable: PromiseLike<any> | any | void): thenable is Promise<any> {
  return thenable !== undefined
    ? typeof thenable.then === "function"
    : false;
}

export function toKebabCase(input: string) {
  return input.trim().split(/(?=[A-Z])/).join("-").toLowerCase();
}

interface ClassObject {
  [name: string]: boolean;
}

export function klass(classes: ClassObject) {
  const filteredClasses: string[] = [];
  for (const name in classes) {
    if (classes[name]) {
      filteredClasses.push(name);
    }
  }
  return filteredClasses.length ? filteredClasses.join(" ") : "";
}
