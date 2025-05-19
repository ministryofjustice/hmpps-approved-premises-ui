/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApprovedPremisesApplication, ApprovedPremisesAssessment } from '@approved-premises/api'
import 'reflect-metadata'

type Constructor = new (...args: Array<any>) => object

const Page = (options: {
  bodyProperties: Array<string>
  name: string
  controllerActions?: { update: string }
  mergeBody?: boolean
}) => {
  return <T extends Constructor>(constructor: T) => {
    const TaskListPage = class extends constructor {
      name = options.name

      body: Record<string, unknown>

      document: ApprovedPremisesApplication | ApprovedPremisesAssessment

      constructor(...args: Array<any>) {
        super(...args)
        const [body, document] = args

        if (options.mergeBody) {
          this.body = { ...(this.body || {}), ...this.createBody(body, ...options.bodyProperties) }
        } else {
          this.body = this.createBody(body, ...options.bodyProperties)
        }
        this.document = document
      }

      createBody<K extends string>(body: Record<string, any>, ...keys: Array<K>): { [Key in K]: Key } {
        const record = {} as { [Key in K]: Key }
        keys.forEach(key => {
          record[key] = body[key]
        })
        return record
      }
    }

    Reflect.defineMetadata('page:name', options.name, TaskListPage)
    Reflect.defineMetadata('page:className', constructor.name, TaskListPage)
    Reflect.defineMetadata('page:bodyProperties', options.bodyProperties, TaskListPage)
    Reflect.defineMetadata('page:controllerActions:update', options.controllerActions?.update, TaskListPage)

    return TaskListPage
  }
}

export default Page
