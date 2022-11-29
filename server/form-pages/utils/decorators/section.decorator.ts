/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata'

type Constructor = new (...args: any[]) => {}

const Section = (options: { name: string; tasks: Array<Constructor> }) => {
  return <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata('section:name', options.name, constructor)
    Reflect.defineMetadata('section:tasks', options.tasks, constructor)
  }
}

export default Section
