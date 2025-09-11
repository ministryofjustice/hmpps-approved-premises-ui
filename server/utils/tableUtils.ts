import { RiskTierEnvelope } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { DateFormats } from './dateUtils'
import { tierBadge } from './personUtils'
import { pluralize } from './utils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

export const textCell = (text: string): TableCell => ({ text })

export const htmlCell = (html: string): TableCell => ({ html })

export const dateCell = (date: string): TableCell => textCell(DateFormats.isoDateToUIDate(date, { format: 'short' }))

export const crnCell = (item: { crn?: string }): TableCell => ({ text: item.crn })

export const tierCell = (item: { tier?: RiskTierEnvelope }) => {
  return {
    html: tierBadge(item.tier?.value?.level),
  }
}

export const emailCell = (item: { email?: string }): TableCell => ({ text: item.email })

export const daysUntilDueCell = (item: { dueAt: string }, warningClass: string): TableCell => {
  const dueDate = DateFormats.isoToDateObj(item.dueAt)
  const daysUntilDue = DateFormats.differenceInBusinessDays(dueDate, new Date())
  const formattedDifference = pluralize('Day', daysUntilDue)

  let html: string

  switch (true) {
    case daysUntilDue === 0:
      html = `<strong class="${warningClass}">Today</strong>`
      break
    case daysUntilDue < 0:
      html = `<strong class="${warningClass}">${formattedDifference}<span class="govuk-visually-hidden"> (Overdue by ${pluralize('day', Math.abs(daysUntilDue))})</span></strong>`
      break
    case daysUntilDue < DUE_DATE_APPROACHING_DAYS_WINDOW:
      html = `<strong class="${warningClass}">${formattedDifference}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
      break
    default:
      html = formattedDifference
  }

  return {
    html,
    attributes: {
      'data-sort-value': daysUntilDue,
    },
  }
}
