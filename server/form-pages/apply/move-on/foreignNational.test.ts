import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ForeignNational from './foreignNational'

describe('ForeignNational', () => {
  describe('title', () => {
    expect(new ForeignNational({}).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ForeignNational({
        response: 'yes',
        'date-day': 22,
        'date-month': 2,
        'date-year': 2022,
        something: 'else',
      })
      expect(page.body).toEqual({ response: 'yes', date: '2022-02-22' })
    })
  })

  itShouldHaveNextValue(new ForeignNational({}), '')
  itShouldHavePreviousValue(new ForeignNational({}), 'type-of-accommodation')

  describe('errors', () => {
    it('if no response is given an error is returned', () => {
      expect(new ForeignNational({}).errors()).toEqual({
        response:
          'You must confirm whether you have informed the Home Office that accommodation will be required after placement',
      })
    })

    it('if the response is "yes" but no date is supplied an error is returned', () => {
      expect(
        new ForeignNational({
          response: 'yes',
        }).errors(),
      ).toEqual({
        date: 'You must confirm the date of notification',
      })
    })
  })

  describe('response', () => {
    it("If the response is 'no' only the response is returned", () => {
      expect(
        new ForeignNational({
          response: 'no',
        }).response(),
      ).toEqual({
        "Have you informed the Home Office 'Foreign National Returns Command' that accommodation will be required after placement?":
          'No',
      })
    })

    it("If the response is 'yes' the response is returned with the date", () => {
      expect(
        new ForeignNational({
          response: 'yes',
          'date-day': 22,
          'date-month': 2,
          'date-year': 2022,
        }).response(),
      ).toEqual({
        "Have you informed the Home Office 'Foreign National Returns Command' that accommodation will be required after placement?":
          'Yes',
        'Date of notification': 'Tuesday 22 February 2022',
      })
    })
  })
})
