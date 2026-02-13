import * as nunjucks from 'nunjucks'

import type {
  CheckBoxItem,
  ErrorMessages,
  HtmlItem,
  RadioItem,
  RadioItemButton,
  SelectOption,
  SummaryListItem,
  TextItem,
} from '@approved-premises/ui'
import type { RiskTierLevel } from '@approved-premises/api'
import { PlacementRequestStatus } from '@approved-premises/api'
import { isCardinal, resolvePath, sentenceCase } from './utils'
import { DateFormats } from './dateUtils'
import postcodeAreas from '../etc/postcodeAreas.json'

export const dateFieldValues = (
  fieldName: string,
  context: Record<string, unknown>,
  errors: ErrorMessages = {},
  defaultToToday = false,
) => {
  let day = context[`${fieldName}-day`]
  let month = context[`${fieldName}-month`]
  let year = context[`${fieldName}-year`]

  if (defaultToToday && !day && !month && !year) {
    const today = new Date()
    day = day || today.getDate()
    month = month || today.getMonth() + 1
    year = year || today.getFullYear()
  }

  const errorClass = errors[fieldName] ? 'govuk-input--error' : ''

  return [
    {
      classes: `govuk-input--width-2 ${errorClass}`,
      name: 'day',
      value: day,
    },
    {
      classes: `govuk-input--width-2 ${errorClass}`,
      name: 'month',
      value: month,
    },
    {
      classes: `govuk-input--width-4 ${errorClass}`,
      name: 'year',
      value: year,
    },
  ]
}

export const convertObjectsToRadioItems = (
  items: Array<Record<string, string>>,
  textKey: string,
  valueKey: string,
  fieldName: string,
  context: Record<string, unknown>,
): Array<RadioItemButton> => {
  return items.map(item => {
    return {
      text: item[textKey],
      value: item[valueKey],
      checked: resolvePath(context, fieldName) === item[valueKey],
    }
  })
}

export const convertObjectsToSelectOptions = (
  items: Array<Record<string, string>>,
  selectAllPrompt: string,
  textKey: string,
  valueKey: string,
  fieldName: string,
  selectAllValue: string = '',
  context: Record<string, unknown> = {},
): Array<SelectOption> => {
  const options = []
  if (selectAllPrompt) {
    options.push({
      value: selectAllValue,
      text: selectAllPrompt,
      selected: !context[fieldName] || context[fieldName] === '',
    })
  }

  items.forEach(item => {
    options.push({
      text: item[textKey],
      value: item[valueKey],
      selected: context[fieldName] === item[valueKey],
    })
  })

  return options
}

export function convertKeyValuePairToRadioItems<T extends object>(
  object: T,
  checkedItem?: keyof T,
  conditionals?: Partial<Record<keyof T, HtmlItem>>,
  hints?: Partial<Record<keyof T, TextItem | HtmlItem>>,
): Array<RadioItemButton> {
  return Object.keys(object).map(key => {
    return {
      value: key,
      text: object[key as keyof T] as string,
      checked: checkedItem === key,
      conditional: conditionals ? conditionals[key as keyof T] : undefined,
      hint: hints ? hints[key as keyof T] : undefined,
    }
  })
}

export function convertKeyValuePairToCheckBoxItems<T extends object>(
  object: T,
  checkedItems: Array<string> = [],
  exclusiveLastOption = false,
): Array<CheckBoxItem> {
  const items: Array<CheckBoxItem> = Object.keys(object).map(key => ({
    value: key,
    text: object[key as keyof T] as string,
    checked: checkedItems.includes(key),
  }))

  if (exclusiveLastOption) {
    items.splice(-1, 1, { divider: 'or' }, { ...items.at(-1), behaviour: 'exclusive' })
  }

  return items
}

export function convertArrayToRadioItems<T extends string>(
  array: Array<T> | ReadonlyArray<T>,
  checkedItem: string,
  labels?: Partial<Record<T, string>>,
  hints?: Partial<Record<T, TextItem | HtmlItem>>,
): Array<RadioItem> {
  return array.map(key => {
    const radioItem: RadioItem = {
      value: key,
      text: labels?.[key] ? labels[key] : sentenceCase(key),
      checked: checkedItem === key,
    }

    if (hints?.[key]) {
      radioItem.hint = hints[key]
    }

    return radioItem
  })
}

export function convertArrayToCheckboxItems(
  array: Array<string>,
  conditionals: Array<string> = [],
): Array<CheckBoxItem> {
  return array.map((key, i) => {
    return {
      value: key,
      text: sentenceCase(key),
      conditional: { html: conditionals[i] },
    }
  })
}

export function convertKeyValuePairsToSummaryListItems<T extends object>(
  values: T,
  titles: Record<string, string>,
): Array<SummaryListItem> {
  return Object.keys(values).map(key => summaryListItem(titles[key], String(values[key as keyof T])))
}

export type RenderAs = keyof TextItem | keyof HtmlItem | 'textBlock' | 'date' | 'time'

const renderSummaryValue = (value: string, renderAs: RenderAs) => {
  switch (renderAs) {
    case 'textBlock':
      return { html: `<span class="govuk-summary-list__textblock">${value}</span>` }
    case 'date':
      return { text: (value && DateFormats.isoDateToUIDate(value)) || '' }
    case 'html':
      return { html: value }
    case 'time':
      return { text: (value && DateFormats.formatTime(value)) || '' }
    default:
      return { text: value }
  }
}

export const summaryListItem = (label: string, value: string, renderAs: RenderAs = 'text'): SummaryListItem => ({
  key: { text: label },
  value: renderSummaryValue(value, renderAs),
})

export const summaryListItemNoBlankRows = (
  label: string,
  value: string,
  renderAs: RenderAs = 'text',
): SummaryListItem => (value ? summaryListItem(label, value, renderAs) : undefined)

/**
 * Performs validation on the area of a postcode (IE the first three or four characters)
 * @param potentialPostcode string to be validated.
 * @returns true if the string is valid, false otherwise.
 */
export function validPostcodeArea(potentialPostcode: string) {
  return postcodeAreas.includes(potentialPostcode.trim().toUpperCase())
}

/**
 * Performs validation on a set of 'weeks' and 'days' fields
 * @returns true if both fields are cardinal numbers or if one is a cardinal number and the other is empty
 * @param weeks
 * @param days
 */
export function validWeeksAndDaysDuration(weeks: string, days: string) {
  return (isCardinal(weeks) && isCardinal(days)) || (isCardinal(weeks) && !days) || (!weeks && isCardinal(days))
}

/**
 * Returns the input if it is an array other.
 * If the input is truthy and not an array it returns the input in an array
 * Useful for checkboxes where if a single value is returned it is string but when multiple values are selected they are an array of strings.
 * @param input input to be put into a flat array.
 * @returns a flat array or an empty array.
 */
export function flattenCheckboxInput<T extends string | Array<T>>(input: T | Array<T>) {
  if (Array.isArray(input)) return input
  if (input) return [input].flat()
  return []
}

/**
 * @param input any
 * @returns true if the input is an empty array, an array of strings or a string otherwise false
 */
export function isStringOrArrayOfStrings(input: unknown) {
  return (
    (Array.isArray(input) && input.every((element: unknown) => typeof element === 'string')) ||
    typeof input === 'string'
  )
}

export const escape = (text: string): string => {
  const escapeFilter = new nunjucks.Environment().getFilter('escape')
  return escapeFilter(text).val
}

export const tierSelectOptions = (selectedOption: RiskTierLevel | undefined): Array<SelectOption> => {
  const tiers = ['D0', 'D1', 'D2', 'D3', 'C0', 'C1', 'C2', 'C3', 'B0', 'B1', 'B2', 'B3', 'A0', 'A1', 'A2', 'A3']

  const options = tiers.map(tier => ({
    text: tier,
    value: tier,
    selected: tier === selectedOption,
  }))

  options.unshift({
    text: 'Please select',
    value: '',
    selected: selectedOption === undefined,
  })

  return options
}

export const placementRequestStatus: Record<PlacementRequestStatus, string> = {
  notMatched: 'Ready to book',
  unableToMatch: 'Unable to book',
  matched: 'Booked',
}

export const placementRequestStatusSelectOptions = (
  selectedOption: PlacementRequestStatus | undefined | null,
): Array<SelectOption> => {
  const options = Object.entries(placementRequestStatus).map(([value, text]) => ({
    text,
    value,
    selected: value === selectedOption,
  }))

  options.unshift({
    text: 'All statuses',
    value: '' as PlacementRequestStatus,
    selected: !selectedOption,
  })

  return options
}

export const bulletList = (items: Array<string>): string => {
  return items.length
    ? `<ul class="govuk-list govuk-list--bullet">${items.map(item => `<li>${item}</li>`).join('')}</ul>`
    : ''
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.gov\.uk$/i
  return emailRegex.test(email)
}
