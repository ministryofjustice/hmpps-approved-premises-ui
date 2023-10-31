/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata'
import { getPagesForSections, getSection } from '../index'

type Constructor = new (...args: Array<any>) => {}

const Form = (options: { sections: Array<unknown> }) => {
  return <T extends Constructor>(constructor: T) => {
    const FormClass = class extends constructor {
      static pages = getPagesForSections(options.sections as Array<Record<string, unknown>>)

      static sections = options.sections.map(s => getSection(s as Record<string, unknown>))
    }

    return FormClass
  }
}

export default Form
