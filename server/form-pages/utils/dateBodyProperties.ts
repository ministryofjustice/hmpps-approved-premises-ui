import { ObjectWithDateParts } from '@approved-premises/ui'

export const dateBodyProperties = <K extends string>(root: K): Array<keyof ObjectWithDateParts<K>> => {
  return [root, `${root}-year`, `${root}-month`, `${root}-day`]
}
