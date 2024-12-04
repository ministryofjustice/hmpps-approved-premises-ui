import { validateSpaceBooking } from './validateSpaceBooking'

describe('validateSpaceBooking', () => {
  it('validation succeeds', () => {
    const body = {
      'arrivalDate-day': '15',
      'arrivalDate-month': '5',
      'arrivalDate-year': '2025',
      'departureDate-day': '10',
      'departureDate-month': '12',
      'departureDate-year': '2025',
    }
    const expectedErrors = {}
    expect(validateSpaceBooking(body)).toEqual(expectedErrors)
  })

  describe('validation fails', () => {
    it.each([
      [
        'blank arrival day',
        {
          'arrivalDate-day': '',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '10',
          'departureDate-month': '12',
          'departureDate-year': '2025',
        },
        {
          arrivalDate: 'You must enter a arrival date',
        },
      ],
      [
        'blank arrival month',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '',
          'arrivalDate-year': '2025',
          'departureDate-day': '10',
          'departureDate-month': '12',
          'departureDate-year': '2025',
        },
        {
          arrivalDate: 'You must enter a arrival date',
        },
      ],
      [
        'blank arrival year',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '',
          'departureDate-day': '10',
          'departureDate-month': '12',
          'departureDate-year': '2025',
        },
        {
          arrivalDate: 'You must enter a arrival date',
        },
      ],
      [
        'blank arrival date fields',
        {
          'arrivalDate-day': '',
          'arrivalDate-month': '',
          'arrivalDate-year': '',
          'departureDate-day': '10',
          'departureDate-month': '12',
          'departureDate-year': '2025',
        },
        {
          arrivalDate: 'You must enter a arrival date',
        },
      ],
      [
        'blank departure day',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '',
          'departureDate-month': '12',
          'departureDate-year': '2025',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure month',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '10',
          'departureDate-month': '',
          'departureDate-year': '2025',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure year',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '10',
          'departureDate-month': '12',
          'departureDate-year': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure date fields',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '',
          'departureDate-month': '',
          'departureDate-year': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
    ])('with %s', (_, body, expected) => {
      expect(validateSpaceBooking(body)).toEqual(expected)
    })
  })
})
