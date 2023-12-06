import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import DateOfPlacement from './datesOfPlacement'

describe('DateOfPlacement', () => {
  const body = {
    datesOfPlacement: [
      {
        durationDays: '1',
        durationWeeks: '2',
        'arrivalDate-day': '1',
        'arrivalDate-month': '12',
        'arrivalDate-year': '2023',
      },
      {
        durationDays: '2',
        durationWeeks: '3',
        'arrivalDate-day': '2',
        'arrivalDate-month': '1',
        'arrivalDate-year': '2024',
      },
    ],
  }

  describe('body', () => {
    it('should set the body', () => {
      expect(new DateOfPlacement(body).body).toEqual({
        datesOfPlacement: [
          {
            duration: '15',
            durationDays: '1',
            durationWeeks: '2',
            'arrivalDate-year': '2023',
            'arrivalDate-month': '12',
            'arrivalDate-day': '1',
            arrivalDate: '2023-12-01',
          },
          {
            duration: '23',
            durationDays: '2',
            durationWeeks: '3',
            'arrivalDate-year': '2024',
            'arrivalDate-month': '1',
            'arrivalDate-day': '2',
            arrivalDate: '2024-01-02',
          },
        ],
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

    it('should return errors if the first date and duration is blank', () => {
      const page = new DateOfPlacement(fromPartial({}))
      expect(page.errors()).toEqual({
        datesOfPlacement_0_arrivalDate: 'You must enter a date for the placement',
        datesOfPlacement_0_duration: 'You must enter a duration for the placement',
      })
    })

    it('should return an error if the first date is blank', () => {
      const page = new DateOfPlacement(
        fromPartial({
          datesOfPlacement: [
            { ...body.datesOfPlacement[0], 'arrivalDate-day': '', 'arrivalDate-month': '', 'arrivalDate-year': '' },
          ],
        }),
      )
      expect(page.errors()).toEqual({
        datesOfPlacement_0_arrivalDate: 'You must state a valid arrival date',
      })
    })

    it('should return an error if the first duration is blank', () => {
      const page = new DateOfPlacement(
        fromPartial({ datesOfPlacement: [{ ...body.datesOfPlacement[0], durationDays: '', durationWeeks: '' }] }),
      )
      expect(page.errors()).toEqual({
        datesOfPlacement_0_duration: 'You must state the duration of the placement',
      })
    })

    it('should return errors if the placement date is invalid', () => {
      const page = new DateOfPlacement({
        datesOfPlacement: [
          {
            ...body.datesOfPlacement[0],
            'arrivalDate-day': '9999999',
            'arrivalDate-month': '99',
            'arrivalDate-year': '32',
          },
        ],
      })
      expect(page.errors()).toEqual({ datesOfPlacement_0_arrivalDate: 'You must state a valid arrival date' })
    })

    it('should return errors if the duration is empty', () => {
      const page = new DateOfPlacement({
        datesOfPlacement: [
          {
            ...body.datesOfPlacement[0],
            durationDays: '0',
            durationWeeks: '0',
          },
        ],
      })

      expect(page.errors()).toEqual({ datesOfPlacement_0_duration: 'You must state the duration of the placement' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DateOfPlacement(body)

      expect(page.response()).toEqual({
        'Dates of placement': [
          {
            'How long should the Approved Premises placement last?': '2 weeks, 1 day',
            'When will the person arrive?': 'Friday 1 December 2023',
          },
          {
            'How long should the Approved Premises placement last?': '3 weeks, 2 days',
            'When will the person arrive?': 'Tuesday 2 January 2024',
          },
        ],
      })
    })
  })
})
