import { Person, PersonRisks } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { tierBadge } from './personUtils'

export const nameCell = (item: { person?: Person }): TableCell => ({ text: item?.person?.name || '' })

export const crnCell = (item: { person?: Person }): TableCell => ({ text: item?.person?.crn || '' })

export const tierCell = (item: { risks?: PersonRisks }) => {
  return {
    html: tierBadge(item.risks.tier?.value?.level),
  }
}
