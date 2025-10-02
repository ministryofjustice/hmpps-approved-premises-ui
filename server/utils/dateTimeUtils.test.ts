import InvalidDateStringError from '../errors/invalidDateStringError'
import DateTimeFormats from './dateTimeUtils'

describe('DateTimeFormats', () => {
  describe('isoDateToUIDate', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateTimeFormats.isoDateToUIDate(date)).toEqual('Friday 11 November 2022')
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateTimeFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateTimeFormats.isoDateToUIDate(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('dateObjToUiDate', () => {
    it('converts a date to a short format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date, { format: 'short' })).toEqual('11/11/2022')
    })

    it('converts a date to a medium format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date, { format: 'medium' })).toEqual('11 November 2022')
    })

    it('converts a date to a long format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateTimeFormats.dateObjtoUIDate(date)).toEqual('Friday 11 November 2022')
    })
  })

  describe('isoToDateObj', () => {
    it('converts a ISO8601 date string', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateTimeFormats.isoToDateObj(date)).toEqual(new Date(2022, 10, 11))
    })

    it('raises an error if the date is not a valid ISO8601 date string', () => {
      const date = '23/11/2022'

      expect(() => DateTimeFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })

    it('raises an error if the date is not a date string', () => {
      const date = 'NOT A DATE'

      expect(() => DateTimeFormats.isoToDateObj(date)).toThrow(new InvalidDateStringError(`Invalid Date: ${date}`))
    })
  })

  describe('stripTime', () => {
    it('strips ":SS" data from a time string', () => {
      const time = '23:12:12'

      expect(DateTimeFormats.stripTime(time)).toEqual('23:12')
    })

    it('returns the same if no seconds data', () => {
      const time = '23:12'

      expect(DateTimeFormats.stripTime(time)).toEqual('23:12')
    })

    const invalidTimes = ['23:12;00', '23:12trr', 'someText', 'some:text', 'tr:12:13', 'tr:12:']

    it.each(invalidTimes)('raises an error if the time is not in the right format', time => {
      expect(() => DateTimeFormats.stripTime(time)).toThrow(new InvalidDateStringError(`Invalid time: ${time}`))
    })
  })
})
