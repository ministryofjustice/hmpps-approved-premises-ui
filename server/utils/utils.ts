import Case from 'case'
import qs, { IStringifyOptions } from 'qs'

import type { PersonRisksUI, SummaryListItem } from '@approved-premises/ui'
import type { PersonRisks } from '@approved-premises/api'

import { DateFormats } from './dateUtils'

/* istanbul ignore next */
const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

/* istanbul ignore next */
const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the autherror page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Converts a string from any case to kebab-case
 * @param string string to be converted.
 * @returns name converted to kebab-case.
 */
export const kebabCase = (string: string) =>
  string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

/**
 * Converts a string from any case to camelCase
 * @param string string to be converted.
 * @returns name converted to camelCase.
 */
export const camelCase = (string: string) => Case.camel(string)

/**
 * Converts a string from any case to PascalCase
 * @param string string to be converted.
 * @returns name converted to PascalCase.
 */
export const pascalCase = (string: string) => camelCase(string).replace(/\w/, s => s.toUpperCase())

/**
 * Converts a string from any case to Sentence case
 * @param string string to be converted.
 * @returns name converted to sentence case.
 */
export const sentenceCase = (string: string) => Case.sentence(string)

export const lowerCase = (string: string) => Case.lower(string)

/**
 * Removes any items in an array of summary list items that are blank or undefined
 * @param items an array of summary list items
 * @returns all items with non-blank values
 */
export const removeBlankSummaryListItems = (items: Array<SummaryListItem>): Array<SummaryListItem> => {
  return items.filter(item => {
    if ('html' in item.value) {
      return item.value.html
    }
    if ('text' in item.value) {
      return item.value.text
    }
    return false
  })
}

export const mapApiPersonRisksForUi = (risks: PersonRisks): PersonRisksUI => {
  return {
    ...risks,
    roshRisks: {
      ...risks.roshRisks?.value,
      lastUpdated: risks.roshRisks?.value?.lastUpdated
        ? DateFormats.isoDateToUIDate(risks.roshRisks.value.lastUpdated)
        : '',
    },
    mappa: {
      ...risks.mappa?.value,
      status: risks.mappa?.status,
      lastUpdated: risks.mappa?.value?.lastUpdated ? DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated) : '',
    },
    tier: {
      ...risks.tier?.value,
      lastUpdated: risks.tier?.value?.lastUpdated ? DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated) : '',
    },
    flags: risks.flags.value,
  }
}

export const linkTo = (
  path: string,
  {
    text,
    query = {},
    attributes = {},
    hiddenText = '',
    hiddenPrefix = '',
    openInNewTab = false,
  }: {
    text: string
    query?: Record<string, string>
    attributes?: Record<string, string>
    hiddenText?: string
    hiddenPrefix?: string
    openInNewTab?: boolean
  },
): string => {
  const hiddenSpan = (hidden: string) => (hidden ? `<span class="govuk-visually-hidden">${hidden}</span>` : '')
  const linkBody = `${hiddenSpan(hiddenPrefix)}${text}${hiddenSpan(hiddenText)}`

  const attrBody = Object.keys(attributes)
    .map(a => ` ${a}="${attributes[a]}"`)
    .join('')

  return `<a href="${path}${createQueryString(query, { addQueryPrefix: true })}"${attrBody}${openInNewTab ? ' target="_blank"' : ''}>${linkBody}</a>`
}

/**
 * Returns a value from an object when given a path, the path can be in dot notation or array notation
 * @param object object to find property in
 * @param path path to property
 * @param defaultValue value to return if property is not found
 * @returns the property value or the default value
 */
export const resolvePath = (object: Record<string, unknown>, path: string) =>
  path
    .split(/[.[\]'"]/)
    .filter(p => Boolean(p))
    .reduce((acc, curr) => (acc ? acc[curr] : undefined), object)

export const createQueryString = (
  params: Record<string, unknown> | string,
  options: IStringifyOptions = { encode: false, indices: false, addQueryPrefix: false },
): string => {
  return qs.stringify(params, options)
}

export const objectIfNotEmpty = <T>(object: Record<string, unknown> | T | undefined): T | undefined => {
  if (Object.keys(object).length) {
    return object as T
  }
  return undefined
}

/**
 * Returns a typed array from either an object/string or an array. Useful for handling arrays of query parameters.
 * @param input either an object or string or an array
 * @returns an array or undefined if the input is falsey
 */
export const makeArrayOfType = <T>(input: unknown): Array<T> => {
  if (input) {
    return (Array.isArray(input) ? input : [input]) as Array<T>
  }
  return undefined
}

export const numberToOrdinal = (number: number | string): string =>
  ['First', 'Second', 'Third', 'Fourth', 'Fifth'][Number(number)]

export const linebreaksToParagraphs = (text: string) =>
  `<p class="govuk-body">${(text ?? '')
    .replace(/\r?\n([ \t]*\r?\n)+/g, '</p><p class="govuk-body">')
    .replace(/\r?\n/g, '<br />')}</p>`

/**
 * Filters a record with the given keys from a master list of records
 * @param keys An array of keys to return from `lookup`
 * @param lookup A key/value of records
 * @returns A key/value list with the given keys in `keys`
 */
export const filterByType = <T extends string>(
  keys: Readonly<Array<string>>,
  lookup: Record<T, string>,
): Record<T, string> => {
  return Object.keys(lookup)
    .filter(k => keys.includes(k))
    .reduce((criteria, key: T) => ({ ...criteria, [key]: lookup[key] }), {}) as Record<T, string>
}

/**
 * A naive pluralisation function
 * @param noun the noun to return in plural form if `count` is more than 1
 * @param count how many of the word exist
 * @param irregularPlural the plural form of the noun if not a simple pluralization e.g. 'people'
 * @return A phrase with the count of noun(s)
 */
export const pluralize = (noun: string, count: number, irregularPlural?: string): string =>
  `${count} ${Math.abs(count) !== 1 ? irregularPlural || `${noun}s` : noun}`

/**
 * Join a list of strings with commas and an "and"
 * Oxford commas not included!
 * @param arr array of strings to join
 * @return a string contaning the joined items
 */
export const joinWithCommas = (arr: Array<string>): string => {
  if (arr.length <= 1) return arr[0] || ''
  return `${arr.slice(0, arr.length - 1).join(', ')} and ${arr[arr.length - 1]}`
}

/**
 * Return true if a string contains a cardinal number (including 0)
 * @param str string to test
 * @return true iff string is cardinal
 */
export const isCardinal = (str: string): boolean => {
  return /^\s*\d+\s*$/.test(str)
}

export const objectFilter = (obj: Record<string, unknown>, fields: Array<string>) => {
  return Object.entries(obj).reduce((out, [key, value]) => {
    if (fields.includes(key)) {
      return { ...out, [key]: value }
    }
    return out
  }, {})
}

/**
 * Returns a copy of an object with all undefined keys removed
 * @param object object to clean
 * @return copy of object with undefined keys removed
 */
export const objectClean = <T>(object: Record<string, unknown>): T => {
  const obj = { ...object } as T
  Object.keys(obj).forEach(key => obj[key as keyof T] === undefined && delete obj[key as keyof T])
  return obj
}

/**
 * Waits until all promises have either resolved or rejected.
 * @param promises Array of promises to settle
 * @param defaults Array of default values to return if a promise rejects
 * @return Array containing either the result, if a promise has resolved, or undefined if it rejected.
 *
 * @example
 *   const [offences, offenceAnswers] = await settlePromises<[Array<ActiveOffence>,Cas1OASysGroup]>([
 *     personService.getOffences(token, crn),
 *     personService.getOasysAnswers(token, crn, 'offenceDetails'),
 *   ])
 */

export const settlePromises = async <T>(promises: Array<Promise<unknown>>, defaults?: Array<unknown>): Promise<T> => {
  const results = await Promise.allSettled(promises)
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    return defaults ? defaults[index] : undefined
  }) as T
}
