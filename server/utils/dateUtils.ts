import {
  Duration,
  addBusinessDays as addBusinsessDaysWithoutBankHolidays,
  addDays,
  differenceInBusinessDays as differenceInBusinessDaysDateFns,
  differenceInDays,
  format,
  formatDistanceStrict,
  formatDuration,
  formatISO,
  isBefore,
  isPast,
  isToday as isTodayDateFns,
  isValid,
  isWeekend,
  isWithinInterval,
  parseISO,
  toDate,
} from 'date-fns'

import type { ObjectWithDateParts } from '@approved-premises/ui'

import rawBankHolidays from '../data/bankHolidays/bank-holidays.json'

type DifferenceInDays = { ui: string; number: number }

type DurationWithNumberOrString = {
  years?: number | string
  months?: number | string
  weeks?: number | string
  days?: number | string
  hours?: number | string
  minutes?: number | string
  seconds?: number | string
}
export class DateFormats {
  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18'.
   */
  static dateObjToIsoDate(date: Date) {
    return formatISO(date, { representation: 'date' })
  }

  /**
   * @param date JS Date object.
   * @returns the date in the format '2019-09-18T19:00:52Z'.
   */
  static dateObjToIsoDateTime(date: Date) {
    return formatISO(date)
  }

  /**
   * @param date JS Date object.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static dateObjtoUIDate(date: Date, options: { format: 'short' | 'long' } = { format: 'long' }) {
    if (options.format === 'long') {
      return format(date, 'cccc d MMMM y')
    }
    return format(date, 'dd/LL/y')
  }

  /**
   * @param date JS Date object.
   * @returns the date in the to be shown in the heading row of the calendar: "20".
   */
  static calendarDate(date: Date) {
    return format(date, 'd')
  }

  /**
   * Converts an ISO8601 datetime string into a Javascript Date object.
   * @param date An ISO8601 datetime string
   * @returns A Date object
   * @throws {InvalidDateStringError} If the string is not a valid ISO8601 datetime string
   */
  static isoToDateObj(date: string) {
    let parsedDate: Date

    try {
      parsedDate = parseISO(date)
    } catch (err) {
      throw new InvalidDateStringError(`Invalid Date: ${date}`)
    }

    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvalidDateStringError(`Invalid Date: ${date}`)
    }

    return parsedDate
  }

  /**
   * @param isoDate an ISO8601 date string.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static isoDateToUIDate(isoDate: string, options: { format: 'short' | 'long' } = { format: 'long' }) {
    return DateFormats.dateObjtoUIDate(DateFormats.isoToDateObj(isoDate), options)
  }

  /**
   * @param isoDate an ISO8601 date string.
   * @returns the date in the to be shown in the UI: "Thursday, 20 December 2012".
   */
  static isoDateTimeToUIDateTime(isoDate: string) {
    return format(DateFormats.isoToDateObj(isoDate), 'd MMM y, HH:mm')
  }

  /**
   * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
   * into an ISO8601 date string
   * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
   * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
   * @returns an ISO8601 date string as part of an ObjectWithDateParts.
   */
  static dateAndTimeInputsToIsoString<K extends string | number>(
    dateInputObj: ObjectWithDateParts<K>,
    key: K,
  ): ObjectWithDateParts<K> {
    const day = `0${dateInputObj[`${key}-day`]}`.slice(-2)
    const month = `0${dateInputObj[`${key}-month`]}`.slice(-2)
    const year = dateInputObj[`${key}-year`]
    const time = dateInputObj[`${key}-time`]

    const o: { [P in K]?: string } = dateInputObj
    if (day && month && year) {
      if (time) {
        o[key] = `${year}-${month}-${day}T${time}:00.000Z`
      } else {
        o[key] = `${year}-${month}-${day}`
      }
    } else {
      o[key] = undefined
    }

    return dateInputObj
  }

  /**
   * Converts input for a GDS date input https://design-system.service.gov.uk/components/date-input/
   * into a human readable date for the user
   * @param dateInputObj an object with date parts (i.e. `-month` `-day` `-year`), which come from a `govukDateInput`.
   * @param key the key that prefixes each item in the dateInputObj, also the name of the property which the date object will be returned in the return value.
   * @returns a friendly date.
   */
  static dateAndTimeInputsToUiDate<K extends string | number>(dateInputObj: ObjectWithDateParts<K>, key: K) {
    const iso8601Date = DateFormats.dateAndTimeInputsToIsoString(dateInputObj, key)[key]

    return DateFormats.isoDateToUIDate(iso8601Date)
  }

  static dateObjectToDateInputs<K extends string>(date: Date, key: K): ObjectWithDateParts<K> {
    return {
      [`${key}-year`]: String(date.getFullYear()),
      [`${key}-month`]: String(date.getMonth() + 1),
      [`${key}-day`]: String(date.getDate()),
      [`${key}`]: DateFormats.dateObjToIsoDate(date),
    } as ObjectWithDateParts<K>
  }

  /**
   * @param date1 first day to compare.
   * @param date2 second day to compare.
   * @returns {DifferenceInDays} an object with the difference in days as a string for UI purposes (EG '2 Days') and as a number.
   */
  static differenceInDays(date1: Date, date2: Date): DifferenceInDays {
    return { ui: formatDistanceStrict(date1, date2, { unit: 'day' }), number: differenceInDays(date1, date2) }
  }

  /**
   * differenceInBusinessDays returns the number of business days between two dates excluding holidays.
   * This is the same as date-fns' differenceInBusinessDays, but with the addition of a holidays parameter.
   * We hope to be able to remove this once this PR is merged: https://github.com/date-fns/date-fns/pull/3475
   * @param {Date} dateLeft
   * @param {Date} dateRight
   * @param {Array<Date>} holidays
   * @returns {number}
   */
  static differenceInBusinessDays(dateLeft: Date, dateRight: Date, holidays: Array<Date> = bankHolidays()): number {
    if (!isValid(dateLeft) || !isValid(dateRight)) return NaN

    const { earlierDate, laterDate } = isBefore(dateLeft, dateRight)
      ? { earlierDate: dateLeft, laterDate: dateRight }
      : { earlierDate: dateRight, laterDate: dateLeft }

    const holidaysLength = holidays
      .map(holiday => toDate(holiday))
      .filter(
        holiday => isWithinInterval(holiday, { start: earlierDate, end: laterDate }) && !isWeekend(holiday),
      ).length

    const differenceInBusinessDaysWithoutHolidays = differenceInBusinessDaysDateFns(dateLeft, dateRight)

    return differenceInBusinessDaysWithoutHolidays - holidaysLength
  }

  static isoDateToDateInputs<K extends string>(isoDate: string, key: string): ObjectWithDateParts<K> {
    return DateFormats.dateObjectToDateInputs(DateFormats.isoToDateObj(isoDate), key)
  }

  static formatDuration(
    duration: DurationWithNumberOrString,
    durationFormat: Array<'weeks' | 'days'> = ['weeks', 'days'],
  ): string {
    const formattedDuration: Duration = {}

    Object.keys(duration).forEach(k => {
      formattedDuration[k] = Number(duration[k])
    })

    return formatDuration(formattedDuration, {
      format: durationFormat,
      delimiter: ', ',
    })
  }

  static timeFromDate(date: Date): string {
    return format(date, 'HH:mm')
  }

  static formatDurationBetweenTwoDates(
    date1: string,
    date2: string,
    options: { format: 'short' | 'long' } = { format: 'long' },
  ): string {
    return `${DateFormats.isoDateToUIDate(date1, { format: options.format })} - ${DateFormats.isoDateToUIDate(date2, { format: options.format })}`
  }
}

export const addBusinessDays = (date: Date, days: number, holidays: Array<Date> = bankHolidays()): Date => {
  const businsessDaysToAddWithoutBankHolidays = addBusinsessDaysWithoutBankHolidays(date, days)

  const numberOfHolidayDays = holidays.filter(holiday => {
    return isWithinInterval(holiday, {
      start: date,
      end: businsessDaysToAddWithoutBankHolidays,
    })
  })

  return addDays(businsessDaysToAddWithoutBankHolidays, numberOfHolidayDays.length)
}

export const uiDateOrDateEmptyMessage = (
  object: Record<string, unknown>,
  key: string,
  dateFormFunc: (date: string) => string,
) => {
  if (key in object && object[key] && typeof object[key] === 'string') return dateFormFunc(object?.[key] as string)

  return 'No date supplied'
}

export const dateAndTimeInputsAreValidDates = <K extends string | number>(
  dateInputObj: ObjectWithDateParts<K>,
  key: K,
): boolean => {
  const inputYear = dateInputObj?.[`${key}-year`] as string

  if (inputYear && inputYear.length !== 4) return false

  const dateString = DateFormats.dateAndTimeInputsToIsoString(dateInputObj, key)

  try {
    DateFormats.isoToDateObj(dateString[key])
  } catch (err) {
    if (err instanceof InvalidDateStringError) {
      return false
    }
  }

  return true
}

export const dateIsBlank = <K extends string | number>(
  dateInputObj: Partial<ObjectWithDateParts<K>>,
  key: K,
): boolean => {
  return !['year' as const, 'month' as const, 'day' as const].every(part => !!dateInputObj[`${key}-${part}`])
}

export const dateIsInThePast = (dateString: string): boolean => {
  const date = DateFormats.isoToDateObj(dateString)
  return isPast(date)
}

export const isToday = (date: string): boolean => {
  const dateObj = DateFormats.isoToDateObj(date)
  return isTodayDateFns(dateObj)
}

export const monthOptions = [
  { name: 'January', value: '1' },
  { name: 'February', value: '2' },
  { name: 'March', value: '3' },
  { name: 'April', value: '4' },
  { name: 'May', value: '5' },
  { name: 'June', value: '6' },
  { name: 'July', value: '7' },
  { name: 'August', value: '8' },
  { name: 'September', value: '9' },
  { name: 'October', value: '10' },
  { name: 'November', value: '11' },
  { name: 'December', value: '12' },
]

export const yearOptions = (startYear: number) => getYearsSince(startYear).map(year => ({ name: year, value: year }))

/* eslint-disable */
export const getYearsSince = (startYear: number): Array<string> => {
  const years: Array<string> = []
  const thisYear = new Date().getFullYear()
  while (startYear <= thisYear) {
    years.push((startYear++).toString())
  }
  return years
}

type RawBankHolidays = {
  'england-and-wales': {
    division: 'england-and-wales'
    events: Array<{
      title: string
      date: string
    }>
  }
}

export const bankHolidays = () => {
  return (rawBankHolidays as RawBankHolidays)['england-and-wales'].events.map(event => new Date(event.date))
}

export const todayAtMidnight = () => new Date(new Date().setHours(0, 0, 0, 0))

export class InvalidDateStringError extends Error {}
