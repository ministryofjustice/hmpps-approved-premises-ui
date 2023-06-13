import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import DateOfPlacement, { Body } from './datesOfPlacement'

describe('DateOfPlacement', () => {
  const body = {
    durationDays: '1',
    durationWeeks: '1',
    'arrivalDate-year': '2023',
    'arrivalDate-month': '12',
    'arrivalDate-day': '1',
  } as Body

  describe('body', () => {
    it('should set the body', () => {
      const page = new DateOfPlacement(body)

      expect(page.body).toEqual({
        duration: '8',
        durationDays: '1',
        durationWeeks: '1',
        'arrivalDate-year': '2023',
        'arrivalDate-month': '12',
        'arrivalDate-day': '1',
        arrivalDate: '2023-12-01',
      })
    })
  })

  itShouldHavePreviousValue(new DateOfPlacement(body), 'same-ap')

  itShouldHaveNextValue(new DateOfPlacement(body), 'updates-to-application')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new DateOfPlacement(body)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if dateOfPlacement is blank', () => {
      const page = new DateOfPlacement(fromPartial({}))
      expect(page.errors()).toEqual({
        arrivalDate: "You must state the person's arrival date",
        duration: 'You must state the duration of the placement',
      })
    })

    it('should return errors if the last placement date is invalid', () => {
      const page = new DateOfPlacement({
        ...body,
        'arrivalDate-year': '99999',
        'arrivalDate-month': '99999',
        'arrivalDate-day': '199999',
      })
      expect(page.errors()).toEqual({
        arrivalDate: 'The placement date is invalid',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DateOfPlacement(body)

      expect(page.response()).toEqual({
        'How long should the Approved Premises placement last?': '1 week, 1 day',
        'When will the person arrive?': 'Friday 1 December 2023',
      })
    })
  })
})
