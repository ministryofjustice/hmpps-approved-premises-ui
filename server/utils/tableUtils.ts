import { RiskTierEnvelope } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { tierBadge } from './personUtils'

export const nameCell = (item: { personName?: string }): TableCell => ({ text: item.personName })

export const crnCell = (item: { crn?: string }): TableCell => ({ text: item.crn })

export const tierCell = (item: { tier?: RiskTierEnvelope }) => {
  return {
    html: tierBadge(item.tier?.value?.level),
  }
}

export const emailCell = (item: { email?: string }): TableCell => ({ text: item.email })
