import { subDays } from 'date-fns'
import { fromPartial } from '@total-typescript/shoehorn'

import type { ObjectWithDateParts } from '@approved-premises/ui'

import {
  DateFormats,
  InvalidDateStringError,
  addBusinessDays,
  bankHolidays,
  dateAndTimeInputsAreValidDates,
  dateIsBlank,
  daysToWeeksAndDays,
  isoDateAndTimeToDateObj,
  monthOptions,
  timeIsValid24hrFormat,
  uiDateOrDateEmptyMessage,
  yearOptions,
  timeAddLeadingZero,
  dateIsValid,
} from './dateUtils'

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
    it('converts a local ISO8601 GMT date string', () => {
      const date = '2022-11-11T00:00'

      expect(DateFormats.isoToDateObj(date)).toEqual(new Date('2022-11-11T00:00:00.000Z'))
    })

    it('converts a local ISO8601 BST date string', () => {
      const date = '2022-04-01T00:00'

      expect(DateFormats.isoToDateObj(date)).toEqual(new Date('2022-03-31T23:00:00.000Z'))
    })

    it('converts an ISO8601 UTC date string', () => {
      const date = '2022-04-11T00:00:00.000Z'

      expect(DateFormats.isoToDateObj(date)).toEqual(new Date('2022-04-11T00:00:00.000Z'))
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
    it.each([
      ['2022-11-08T00:00', 'Tue 8 Nov 2022'],
      ['2022-11-11T00:00', 'Fri 11 Nov 2022'],
      ['2025-04-02T23:30', 'Wed 2 Apr 2025'],
      ['2025-04-02T23:30:00.000Z', 'Thu 3 Apr 2025'],
    ])('converts ISO8601 date string %s to a GOV.UK formatted date', (date, expectedUiDate) => {
      expect(DateFormats.isoDateToUIDate(date)).toEqual(expectedUiDate)
    })

    it.each([
      ['2022-11-09T00:00', '9 Nov 2022'],
      ['2022-11-11T00:00', '11 Nov 2022'],
      ['2025-04-02T00:00', '2 Apr 2025'],
      ['2025-04-02T23:30:00.000Z', '3 Apr 2025'],
    ])('converts ISO8601 date %s to a short format date', (date, expectedUiDate) => {
      expect(DateFormats.isoDateToUIDate(date, { format: 'short' })).toEqual(expectedUiDate)
    })

    it.each([
      ['2022-11-09T00:00', 'Wed 9 Nov'],
      ['2022-11-11T00:00', 'Fri 11 Nov'],
      ['2025-04-02T00:00', 'Wed 2 Apr'],
      ['2025-04-02T23:30:00.000Z', 'Thu 3 Apr'],
    ])('converts ISO8601 date %s to a long format date with no year', (date, expectedUiDate) => {
      expect(DateFormats.isoDateToUIDate(date, { format: 'longNoYear' })).toEqual(expectedUiDate)
    })

    it.each([
      ['2022-11-09T00:00', '9 11 2022'],
      ['2022-04-11T00:00', '11 4 2022'],
      ['2025-04-02T00:00', '2 4 2025'],
      ['2025-04-02T23:30:00.000Z', '3 4 2025'],
    ])('converts local ISO8601 date %s to a date field hint format date', (date, expectedUiDate) => {
      expect(DateFormats.isoDateToUIDate(date, { format: 'dateFieldHint' })).toEqual(expectedUiDate)
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
    it.each([
      ['2022-11-09T16:35', '9 Nov 2022, 16:35'],
      ['2022-11-11T10:00', '11 Nov 2022, 10:00'],
      ['2025-04-02T08:13', '2 Apr 2025, 08:13'],
      ['2025-04-02T23:30:00.000Z', '3 Apr 2025, 00:30'],
    ])('converts ISO8601 date %s to a GOV.UK formatted date and time', (date, expectedUiDateTime) => {
      expect(DateFormats.isoDateTimeToUIDateTime(date)).toEqual(expectedUiDateTime)
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

  describe('dateAndTimeInputsToIsoString', () => {
    it('converts date inputs to a local date object', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2025',
        'date-month': '03',
        'date-day': '29',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result).toEqual({
        ...obj,
        date: '2025-03-29',
      })
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

    it('returns the local date with a time if passed one', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '12:35',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01T12:35')
    })

    it('pads the time', () => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2022',
        'date-month': '1',
        'date-day': '1',
        'date-time': '8:15',
      }

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toEqual('2022-01-01T08:15')
    })

    it.each(['day', 'month', 'year'])('returns undefined for the date if the %s is undefined', part => {
      const obj: ObjectWithDateParts<'date'> = {
        'date-year': '2025',
        'date-month': '3',
        'date-day': '14',
      }
      delete obj[`date-${part}` as keyof ObjectWithDateParts<'date'>]

      const result = DateFormats.dateAndTimeInputsToIsoString(obj, 'date')

      expect(result.date).toBeUndefined()
    })

    it('returns undefined for the date when given empty strings as input', () => {
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
      const date = new Date('2022-11-11T10:00')
      const dateTimeInputs = DateFormats.dateObjectToDateInputs(date, 'key')

      expect(DateFormats.dateAndTimeInputsToUiDate(dateTimeInputs, 'key')).toEqual(DateFormats.dateObjtoUIDate(date))
    })

    it('throws an error if an object without date inputs for the key is entered', () => {
      expect(() => DateFormats.dateAndTimeInputsToUiDate(fromPartial<ObjectWithDateParts<'key'>>({}), 'key')).toThrow(
        InvalidDateStringError,
      )
    })
  })

  describe('durationBetweenDates', () => {
    const baseDate = '2023-10-12'
    const baseDateObj = DateFormats.isoToDateObj(baseDate)

    it.each([
      ['2023-10-13', '1 day', 1],
      ['2023-10-15', '3 days', 3],
      ['2023-11-12', '4 weeks 3 days', 31],
      ['2024-01-01', '11 weeks 4 days', 81],
    ])('returns the different in days for %s', (compareDate, ui, number) => {
      expect(DateFormats.durationBetweenDates(baseDate, compareDate)).toEqual({
        ui,
        number,
      })
      const compareDateObj = DateFormats.isoDateToUIDate(compareDate)
      expect(DateFormats.durationBetweenDates(baseDateObj, compareDateObj)).toEqual({
        ui,
        number,
      })
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

  describe('isoDateToMonthAndYear', () => {
    it.each([
      ['2024-12-04', 'December 2024'],
      ['2025-01-01', 'January 2025'],
    ])('returns the month and year for the date %s', (date, expected) => {
      expect(DateFormats.isoDateToMonthAndYear(date)).toEqual(expected)
    })
  })

  describe('dateSlashesToISODate', () => {
    it.each([
      ['1/1/2024', '2024-01-01'],
      ['31/01/2025', '2025-01-31'],
      ['3/11/1999', '1999-11-03'],
      ['not a date', 'not a date'],
      [undefined, undefined],
      ['', undefined],
    ])('returns an ISO date for the date %s', (date, expected) => {
      expect(DateFormats.dateWithSlashesToISODate(date)).toEqual(expected)
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

describe('dateIsValid', () => {
  it.each(['2025-01-01', '1999-12-25'])('returns true for the valid date %s', date => {
    expect(dateIsValid(date)).toEqual(true)
  })

  it.each(['2025-1-1', '1999-12-32', '2025-02-31', '20205-04-13', '2025-01-yeah', 'not even a date'])(
    'returns false for the invalid date %s',
    date => {
      expect(dateIsValid(date)).toEqual(false)
    },
  )
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

  it('returns false when the date is an array (Pen-test APS-1951)', () => {
    const obj: ObjectWithDateParts<'date'> = {
      // @ts-expect-error Simulate array query parameters
      'date-year': ['2020', '2021', '2022', '2023'],
      'date-month': '12',
      'date-day': '11',
    }

    expect(dateAndTimeInputsAreValidDates(obj, 'date')).toEqual(false)
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

describe('daysToWeeksAndDays', () => {
  it('should return zero weeks when a day length is less than 7 days', () => {
    expect(daysToWeeksAndDays(6)).toEqual({ days: 6, weeks: 0 })
  })

  it('should return one week when a day length is 7 days', () => {
    expect(daysToWeeksAndDays(7)).toEqual({ days: 0, weeks: 1 })
  })

  it('should return week and days for a long length', () => {
    expect(daysToWeeksAndDays(52)).toEqual({ days: 3, weeks: 7 })
  })

  it('should convert a string value to a number', () => {
    expect(daysToWeeksAndDays('7')).toEqual({ days: 0, weeks: 1 })
  })
})

describe('timeIsValid24hrFormat', () => {
  it.each(['08:45', '11:20', '23:59', '00:00'])('returns true if the time is valid, like %s', time => {
    expect(timeIsValid24hrFormat(time)).toEqual(true)
  })

  it.each(['8:30pm', '1am', '1.25pm', '08.35', '-1:00', '24:00', '13:78', 'foo', 'no:no', '', '9:4'])(
    'returns false if the time is invalid, like %s',
    time => {
      expect(timeIsValid24hrFormat(time)).toEqual(false)
    },
  )
})

describe('addLeadingZero', () => {
  it.each(['9:35', '0:10', '5:00'])('adds a leading zero to %s', time => {
    expect(timeAddLeadingZero(time)).toEqual(`0${time}`)
  })
  it.each(['19:35', '10:10', '23:00'])('does not add a leading zero to %s', time => {
    expect(timeAddLeadingZero(time)).toEqual(time)
  })
})

describe('dateObjTo24hrTime', () => {
  describe.each([
    ['British Summer Time', '2025-04-01'],
    ['Greenwich Mean Time (UTC)', '2025-01-01'],
  ])('during %s', (_, timezoneDate) => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(timezoneDate))
    })

    it.each([
      ['00:00', 0, 0, 0],
      ['12:01', 12, 1, 1],
      ['23:59', 23, 59, 59],
    ])('returns the local 24-hour time part of the date with time like %s', (expected, h, m, s) => {
      const date = new Date()
      date.setHours(h)
      date.setMinutes(m)
      date.setSeconds(s)
      expect(DateFormats.dateObjTo24hrTime(date)).toBe(expected)
    })
  })
})

describe('isoDateAndTimeToDateObj', () => {
  it.each([
    ['2024-01-01', '05:22', '2024-01-01T05:22'],
    ['2024-12-31', '13:22', '2024-12-31T13:22'],
    ['2025-03-31', '23:30', '2025-03-31T23:30'], // Local date (BST)
    ['2025-04-01', '00:30', '2025-03-31T23:30:00.000Z'], // UTC date (GMT)
    ['2024-12-31', null, '2024-12-31'],
  ])('returns a local date from an iso date and time, %s %s', (dateStr, timeStr, expected) => {
    const date = isoDateAndTimeToDateObj(dateStr, timeStr)
    expect(date.getTime()).toEqual(DateFormats.isoToDateObj(expected).getTime())
  })
})

describe('isoDateTimeToIsoDate', () => {
  it.each([
    ['2025-02-01T12:15', '2025-02-01'],
    ['2025-03-31T23:30', '2025-03-31'], // Local date (BST)
    ['2025-03-31T23:30:00.000Z', '2025-04-01'], // UTC date (GMT)
    ['2024-12-31', '2024-12-31'],
  ])('returns an iso date only from an iso datetime, %s', (dateStr, expected) => {
    expect(DateFormats.isoDateTimeToIsoDate(dateStr)).toEqual(expected)
  })
})

describe('isoDateTimeToIsoTime', () => {
  it.each([
    ['2025-02-01T09:15', '09:15'],
    ['2025-02-01T23:45', '23:45'],
    ['2024-12-31', '00:00'],
    ['2025-03-30T00:00', '00:00'],
    ['2025-04-01T09:30', '09:30'],
    ['2025-04-01T09:30:00.000Z', '10:30'], // UTC date during BST
    ['2025-01-01T09:30:00.000Z', '09:30'], // UTC date during GMT
  ])('returns an iso time only from a local iso datetime, %s', (dateStr, expected) => {
    expect(DateFormats.isoDateTimeToTime(dateStr)).toEqual(expected)
  })
})
