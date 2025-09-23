import InvalidDateStringError from '../errors/invalidDateStringError'
import DateFormats from './dateUtils'

describe('DateFormats', () => {
  describe('isoDateToUIDate', () => {
    it('converts a ISO8601 date string to a GOV.UK formatted date', () => {
      const date = '2022-11-11T00:00:00.000Z'

      expect(DateFormats.isoDateToUIDate(date)).toEqual('Friday 11 November 2022')
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

  describe('dateObjToUiDate', () => {
    it('converts a date to a short format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateFormats.dateObjtoUIDate(date, { format: 'short' })).toEqual('11/11/2022')
    })

    it('converts a date to a medium format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateFormats.dateObjtoUIDate(date, { format: 'medium' })).toEqual('11 November 2022')
    })

    it('converts a date to a long format date', () => {
      const date = new Date('2022-11-11T00:00:00.000Z')

      expect(DateFormats.dateObjtoUIDate(date)).toEqual('Friday 11 November 2022')
    })
  })

  describe('isoToDateObj', () => {
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
})
