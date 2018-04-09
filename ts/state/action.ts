import * as mobx from 'mobx'

import { captureBreadcrumb } from '../sentry'

export function action(_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const func = descriptor.value as Function
  const name = propertyKey
  return {
    value: mobx.action(name, wrapWithBreadcrumb(name, func)),
    enumerable: false,
    configurable: false,
    writable: true,
  }
}

function wrapWithBreadcrumb(name: string, fn: Function) {
  return function actionWithBreadcrumb(this: any, ...args: any[]) {
    captureBreadcrumb('action', {
      name,
      arguments: args,
    })
    return fn.apply(this, args)
  }
}
