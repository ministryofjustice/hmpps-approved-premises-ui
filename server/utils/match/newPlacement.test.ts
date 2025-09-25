import { ValidationError } from '../errors'
import { validateNewPlacement } from './newPlacement'

describe('new placement utils', () => {
  describe('validateNewPlacement', () => {
    const validBody = {
      startDate: '01/01/2026',
      endDate: '01/01/2027',
      reason: 'foo',
    }

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-25'))
    })

    it.each([
      [
        'fields are empty',
        { startDate: '', endDate: '', reason: '' },
        {
          startDate: 'Enter or select an arrival date',
          endDate: 'Enter or select a departure date',
          reason: 'Enter a reason',
        },
      ],
      [
        'the arrival and end dates are invalid',
        { startDate: '32/2/2026', endDate: 'not a date' },
        {
          startDate: 'Enter a valid arrival date',
          endDate: 'Enter a valid departure date',
        },
      ],
      [
        'the arrival and departure dates are in the past',
        { startDate: '01/01/2024', endDate: '01/01/2025' },
        { startDate: 'The arrival date must be in the future', endDate: 'The departure date must be in the future' },
      ],
      [
        'the departure date is before the start date',
        { endDate: '12/12/2025' },
        { endDate: 'The departure date must be after the arrival date' },
      ],
    ])('throws an error when %s', (_, body, expectedErrors) => {
      const fullBody = { ...validBody, ...body }

      let error
      try {
        validateNewPlacement(fullBody)
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.data).toEqual(expectedErrors)
    })
  })
})
