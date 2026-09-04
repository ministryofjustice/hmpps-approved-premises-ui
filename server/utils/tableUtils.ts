import { Person, PersonSummary } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { DateFormats } from './dateUtils'
import { displayName, getVersionedTierOrBlank, personTier } from './personUtils'
import { pluralize } from './utils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

export const textCell = (text: string): TableCell => ({ text })

export const htmlCell = (html: string): TableCell => ({ html })

export const dateCell = (date: string): TableCell =>
  textCell(date ? DateFormats.isoDateToUIDate(date, { format: 'short' }) : '')

export const textCellNoWrap = (text: string): TableCell =>
  htmlCell(`<span class="govuk-table__cell--nowrap">${text}</span>`)

export const dateCellNoWrap = (date: string): TableCell =>
  textCellNoWrap(date ? DateFormats.isoDateToUIDate(date, { format: 'short' }) : '')

export const dateCellSortable = (date: string): TableCell => ({
  text: date ? DateFormats.isoDateToUIDate(date, { format: 'short' }) : '',
  attributes: { 'data-sort-value': date },
})

export const crnCell = (item: { crn?: string }): TableCell => ({ text: item.crn })

const tierSortKey = (person: Person | PersonSummary) => {
  const { tierScore, version } = personTier(person) || {}
  if (version === 'V2' && /^[A-Z][0-9]/.test(tierScore))
    return tierScore.charAt(0).concat(String(9 - +tierScore.charAt(1)), tierScore.slice(2))

  return tierScore || ''
}

export const versionedTierCell = (person: Person | PersonSummary) => ({
  html: getVersionedTierOrBlank(person),
  attributes: { 'data-sort-value': tierSortKey(person) },
})

export const nameCellLink = (person: Person, link?: string) =>
  htmlCell(
    `${link ? `<a href="${link}">${displayName(person)}</a>` : `<span>${displayName(person)}</span>`}<br/><span>${person.crn}</span>`,
  )

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
