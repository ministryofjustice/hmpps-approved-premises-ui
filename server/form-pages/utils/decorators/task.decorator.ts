/* eslint-disable @typescript-eslint/no-explicit-any */

import TasklistPage from '../../tasklistPage'

type Constructor = new (...args: Array<any>) => object

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
interface Type<T> extends Function {
  new (...args: Array<any>): T
}

export type Pages = Array<Type<TasklistPage>>

const Task = (options: { name: string; slug: string; pages: Pages }) => {
  return <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata('task:slug', options.slug, constructor)
    Reflect.defineMetadata('task:name', options.name, constructor)
    Reflect.defineMetadata('task:pages', options.pages, constructor)
    options.pages.forEach(page => {
      Reflect.defineMetadata('page:task', options.slug, page)
    })
  }
}

export default Task
