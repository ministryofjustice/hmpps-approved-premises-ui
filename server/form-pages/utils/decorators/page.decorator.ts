import { Application } from '@approved-premises/api'
import 'reflect-metadata'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor = new (...args: any[]) => {}

const Page = (options: { bodyProperties: Array<string>; name: string }) => {
  return <T extends Constructor>(constructor: T) => {
    const TaskListPage = class extends constructor {
      name = options.name

      body: Record<string, unknown>

      application: Application

      previousPage: string

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args)
        const [body, application, previousPage] = args

        this.body = this.createBody(body, ...options.bodyProperties)
        this.application = application
        this.previousPage = previousPage
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createBody<K extends string>(body: Record<string, any>, ...keys: K[]): { [Key in K]: Key } {
        const record = {} as { [Key in K]: Key }
        keys.forEach(key => {
          record[key] = body[key]
        })
        return record
      }
    }

    Reflect.defineMetadata('page:name', options.name, TaskListPage)
    Reflect.defineMetadata('page:bodyProperties', options.bodyProperties, TaskListPage)

    return TaskListPage
  }
}

export default Page
