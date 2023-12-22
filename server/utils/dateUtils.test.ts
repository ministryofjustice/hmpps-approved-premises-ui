/* eslint-disable import/no-duplicates */

import { isPast } from 'date-fns/isPast'
import { differenceInDays } from 'date-fns/differenceInDays'
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict'
import { subDays } from 'date-fns'
import { isToday as isTodayDateFns } from 'date-fns/isToday'
import { fromPartial } from '@total-typescript/shoehorn'

import type { ObjectWithDateParts } from '@approved-premises/ui'

import {
  DateFormats,
  InvalidDateStringError,
  addBusinessDays,
  bankHolidays,
  dateAndTimeInputsAreValidDates,
  dateIsBlank,
  dateIsInThePast,
  isToday,
  monthOptions,
  uiDateOrDateEmptyMessage,
  yearOptions,
} from './dateUtils'

jest.mock('date-fns/isPast')
jest.mock('date-fns/isToday')
jest.mock('date-fns/formatDistanceStrict')
jest.mock('date-fns/differenceInDays')
jest.mock('../data/bankHolidays/bank-holidays.json', () => {
  return {
    'england-and-wales': {
      division: 'england-and-wales',
      events: [
        { title: 'New Year’s Day', date: '2018-01-01', notes: '', bunting: true },
        { title: 'Good Friday', date: '2018-03-30', notes: '', bunting: false },
        { title: 'Easter Monday', date: '2018-04-02', notes: '', bunting: true },
        { title: 'Early May bank holiday', date: '2018-05-07', notes: '', bunting: true },
      ],
    },
  }
})

describe('DateFormats', () => {
  describe('convertIsoToDateObj', () => {
    it('converts a ISO8601 date string', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoToDateObj(date)).toEqual(new Date(2022, 10, 11))
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('isoDateToUIDate', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoDateToUIDate(date)).toEqual('Friday 11 November 2022')
    })

    it('converts a ISO8601 date string to a short format date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoDateToUIDate(date, { format: 'short' })).toEqual('11/11/2022')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('isoDateTimeToUIDateTime', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T10:00:00.000Z'

      expect(DateFormats.isoDateTimeToUIDateTime(date)).toEqual('11 Nov 2022, 10:00')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateFormats.isoDateTimeToUIDateTime(date)).toThrow(
        new InvalidDateStringError(`Invalid Date: ${date}`),
      )
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateFormats.isoDateTimeToUIDateTime(date)).toThrow(
        new InvalidDateStringError(`Invalid Date: ${date}`),
      )
    })
  })

  describe('convertDateAndTimeInputsToIsoString', () => {
    it('converts a date object', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '12',
        'date-day': '11',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-12-11')
    })

    it('pads the months and days', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01')
    })

    it('returns the date with a time if passed one', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '12:35',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01T12:35:00.000Z')
    })

    it('returns an empty string when given empty strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '',
        'date-month': '',
        'date-day': '',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toBeUndefined()
    })

    it('returns an invalid ISO string when given invalid strings as input', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': 'twothousandtwentytwo',
        'date-month': '20',
        'date-day': 'foo',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date.toString()).toEqual('twothousandtwentytwo-20-oo')
    })

    it('returns an invalid ISO string when given all 0s as inputs', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '0000',
        'date-month': '00',
        'date-day': '00',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date.toString()).toEqual('0000-00-00')
    })
  })

  describe('dateAndTimeInputsToUiDate', () => {
    it('converts a date and time input object to a human readable date', () => {
      const dateTimeInputs = DateFormats.dateObjectToDateInputs(new Date('2022-11-11T10:00:00.000Z'), 'key')

      expect(DateFormats.dateAndTimeInputsToUiDate(dateTimeInputs, 'key')).toEqual('Friday 11 November 2022')
    })

    it('throws an error if an object without date inputs for the key is entered', () => {
      expect(() => DateFormats.dateAndTimeInputsToUiDate(fromPartial<ObjectWithDateParts<'key'>>({}), 'key')).toThrow(
        InvalidDateStringError,
      )
    })
  })

  describe('differenceInDays', () => {
    it('calls the date-fns functions and returns the results as an object', () => {
      const date1 = new Date(2023, 3, 12)
      const date2 = new Date(2023, 3, 11)
      ;(formatDistanceStrict as jest.Mock).mockReturnValue('1 day')
      ;(differenceInDays as jest.Mock).mockReturnValue(1)

      expect(DateFormats.differenceInDays(date1, date2)).toEqual({
        ui: '1 day',
        number: 1,
      })
      expect(formatDistanceStrict).toHaveBeenCalledWith(date1, date2, { unit: 'day' })
      expect(differenceInDays).toHaveBeenCalledWith(date1, date2)
    })
  })

  describe('differenceInBusinessDays', () => {
    it('should return NaN if either date is invalid', () => {
      const date1InvalidResult = DateFormats.differenceInBusinessDays(new Date('invalid date'), new Date('2022-01-10'))
      const date2InvalidResult = DateFormats.differenceInBusinessDays(new Date('2022-01-10'), new Date('invalid date'))

      expect(date1InvalidResult).toBeNaN()
      expect(date2InvalidResult).toBeNaN()
    })

    it('returns the number of business days between the given dates, excluding weekends and holidays', () => {
      const holidays = [
        new Date(2023, 7 /* Aug */, 28),
        new Date(2023, 11 /* Dec */, 25),
        new Date(2023, 11 /* Dec */, 26),
      ]

      expect(DateFormats.differenceInBusinessDays(new Date(2024, 0, 10), new Date(2023, 6, 18), holidays)).toBe(123)
    })

    it('ignores holidays the are not in the range', () => {
      const holidays = [
        new Date(2023, 7 /* Aug */, 28),
        new Date(2023, 11 /* Dec */, 25),
        new Date(2023, 11 /* Dec */, 26),
      ]

      expect(DateFormats.differenceInBusinessDays(new Date(2024, 0, 10), new Date(2023, 9, 18), holidays)).toBe(58)
    })

    it('ignores holidays that are at the weekend', () => {
      const holidays = [
        new Date(2023, 7 /* Aug */, 28),
        new Date(2023, 11 /* Dec */, 24),
        new Date(2023, 11 /* Dec */, 25),
        new Date(2023, 11 /* Dec */, 26),
      ]

      expect(DateFormats.differenceInBusinessDays(new Date(2024, 0, 10), new Date(2023, 9, 18), holidays)).toBe(58)
    })

    it('returns the number of business days between the given dates if no holidays are provided', () => {
      expect(DateFormats.differenceInBusinessDays(new Date(2024, 0, 10), new Date(2023, 6, 18))).toBe(126)
    })

    it('returns the correct number of business days if the leftDate is earlier than the rightDate', () => {
      expect(DateFormats.differenceInBusinessDays(subDays(new Date(), 7), new Date())).toBe(-5)
    })
  })

  describe('formatDuration', () => {
    it('formats a duration with the given unit', () => {
      expect(DateFormats.formatDuration({ days: '4', weeks: '7' })).toEqual('7 weeks, 4 days')
    })
  })
})

describe('uiDateOrDateEmptyMessage', () => {
  it('if the date is undefined it returns the message', () => {
    const object: Record<string, undefined> = {
      shouldBeADate: undefined,
    }

    expect(uiDateOrDateEmptyMessage(object, 'shouldBeADate', () => 'string')).toEqual('No date supplied')
  })

  it('if the date is null it returns the message', () => {
    const object: Record<string, undefined> = {
      shouldBeADate: null,
    }

    expect(uiDateOrDateEmptyMessage(object, 'shouldBeADate', () => 'string')).toEqual('No date supplied')
  })

  it('if the date is defined it returns the date formatted using the format function', () => {
    const object: Record<string, string> = {
      aDate: DateFormats.dateObjToIsoDate(new Date(2023, 3, 12)),
    }

    expect(uiDateOrDateEmptyMessage(object, 'aDate', DateFormats.isoDateToUIDate)).toEqual(
      DateFormats.dateObjtoUIDate(new Date(2023, 3, 12)),
    )
  })

  it('returns the message if the key is present in the object but undefined', () => {
    const object: Record<string, string> = {
      aDate: undefined,
    }

    expect(uiDateOrDateEmptyMessage(object, 'aDate', DateFormats.isoDateToUIDate)).toEqual('No date supplied')
  })
})

describe('addBusinessDays', () => {
  it('returns the correct date if the gap doesnt include business days', () => {
    expect(addBusinessDays(new Date(2023, 10, 13), 1)).toEqual(new Date(2023, 10, 14))
  })

  it('returns the correct date if the gap includes a weekend', () => {
    expect(addBusinessDays(new Date(2023, 10, 13), 7)).toEqual(new Date(2023, 10, 22))
  })

  it('returns the correct date if the gap includes a weekend and a bank holiday', () => {
    expect(addBusinessDays(new Date(2023, 10, 13), 7, [new Date(2023, 10, 13)])).toEqual(new Date(2023, 10, 23))
  })
})

describe('dateAndTimeInputsAreValidDates', () => {
  it('returns true when the date is valid', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '2022',
      'date-month': '12',
      'date-day': '11',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(true)
  })

  it('returns false when the date is invalid', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '99',
      'date-month': '99',
      'date-day': '99',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(false)
  })

  it('returns false when the year is not 4 digits', () => {
    const obj: ObjectWithDateParts<'date'> = {
      'date-year': '22',
      'date-month': '12',
      'date-day': '11',
    }

    const result = dateAndTimeInputsAreValidDates(obj, 'date')

    expect(result).toEqual(false)
  })
})

describe('dateIsBlank', () => {
  it('returns false if the date is not blank', () => {
    const date: ObjectWithDateParts<'field'> = {
      'field-day': '12',
      'field-month': '1',
      'field-year': '2022',
    }

    expect(dateIsBlank(date, 'field')).toEqual(false)
  })

  it('returns true if the date is blank', () => {
    const date: ObjectWithDateParts<'field'> = {
      'field-day': '',
      'field-month': '',
      'field-year': '',
    }

    expect(dateIsBlank(date, 'field')).toEqual(true)
  })

  it('ignores irrelevant fields', () => {
    const date: ObjectWithDateParts<'field'> & ObjectWithDateParts<'otherField'> = {
      'field-day': '12',
      'field-month': '1',
      'field-year': '2022',
      'otherField-day': undefined,
      'otherField-month': undefined,
      'otherField-year': undefined,
    }

    expect(dateIsBlank(date, 'field')).toEqual(false)
  })
})

describe('dateIsInThePast', () => {
  it('returns true if the date is in the past', () => {
    ;(isPast as jest.Mock).mockReturnValue(true)

    expect(dateIsInThePast('2020-01-01')).toEqual(true)
  })

  it('returns false if the date is not in the past', () => {
    ;(isPast as jest.Mock).mockReturnValue(false)

    expect(dateIsInThePast('2020-01-01')).toEqual(false)
  })
})

describe('isToday', () => {
  it('returns true if the date is today', () => {
    const dateString = '2020-01-01'
    ;(isTodayDateFns as jest.Mock).mockReturnValue(true)

    expect(isToday(dateString)).toEqual(true)
    expect(isTodayDateFns).toHaveBeenCalledWith(DateFormats.isoToDateObj(dateString))
  })

  it('returns false if the date is not today', () => {
    const dateString = '2020-01-01'
    ;(isTodayDateFns as jest.Mock).mockReturnValue(false)

    expect(isToday(dateString)).toEqual(false)
    expect(isTodayDateFns).toHaveBeenCalledWith(DateFormats.isoToDateObj(dateString))
  })
})

describe('yearOptions', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return years since the start year', () => {
    expect(yearOptions(2020)).toEqual([
      { name: '2020', value: '2020' },
      { name: '2021', value: '2021' },
      { name: '2022', value: '2022' },
    ])
  })
})

describe('monthOptions', () => {
  it('should return each month with a numeric index', () => {
    expect(monthOptions).toEqual([
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
    ])
  })
})

describe('bankHolidays', () => {
  it('maps the bank-holidays.json an array of dates', () => {
    expect(bankHolidays()).toEqual([
      new Date('2018-01-01'),
      new Date('2018-03-30'),
      new Date('2018-04-02'),
      new Date('2018-05-07'),
    ])
  })
})
