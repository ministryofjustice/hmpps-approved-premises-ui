import 'reflect-metadata'
import { getPagesForSections, getSection } from '../index'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: Array<any>) => object

const Form = (options: { sections: Array<unknown> }) => {
  return <T extends Constructor>(constructor: T) => {
    return class extends constructor {
      static pages = getPagesForSections(options.sections as Array<Record<string, unknown>>)

      static sections = options.sections.map(s => getSection(s as Record<string, unknown>))
    }
  }
}

export default Form
