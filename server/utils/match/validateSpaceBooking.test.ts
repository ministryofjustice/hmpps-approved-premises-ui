import { validateSpaceBooking } from './validateSpaceBooking'

describe('validateSpaceBooking', () => {
  const validBookingBody = {
    'arrivalDate-day': '15',
    'arrivalDate-month': '5',
    'arrivalDate-year': '2025',
    'departureDate-day': '16',
    'departureDate-month': '5',
    'departureDate-year': '2025',
  }
  it('validation succeeds', () => {
    const expectedErrors = {}
    expect(validateSpaceBooking(validBookingBody)).toEqual(expectedErrors)
  })

  describe('validation fails', () => {
    it.each([
      [
        'blank arrival day',
        {
          ...validBookingBody,
          'arrivalDate-day': '',
        },
        {
          arrivalDate: 'You must enter an arrival date',
        },
      ],
      [
        'blank arrival month',
        {
          ...validBookingBody,
          'arrivalDate-month': '',
        },
        {
          arrivalDate: 'You must enter an arrival date',
        },
      ],
      [
        'blank arrival year',
        {
          ...validBookingBody,
          'arrivalDate-year': '',
        },
        {
          arrivalDate: 'You must enter an arrival date',
        },
      ],
      [
        'blank arrival date fields',
        {
          ...validBookingBody,
          'arrivalDate-day': '',
          'arrivalDate-month': '',
          'arrivalDate-year': '',
        },
        {
          arrivalDate: 'You must enter an arrival date',
        },
      ],
      [
        'blank departure day',
        {
          ...validBookingBody,
          'departureDate-day': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure month',
        {
          ...validBookingBody,
          'departureDate-month': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure year',
        {
          ...validBookingBody,
          'departureDate-year': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'blank departure date fields',
        {
          ...validBookingBody,
          'departureDate-day': '',
          'departureDate-month': '',
          'departureDate-year': '',
        },
        {
          departureDate: 'You must enter a departure date',
        },
      ],
      [
        'invalid arrival date',
        {
          ...validBookingBody,
          'arrivalDate-day': '31',
          'arrivalDate-month': '2',
          'arrivalDate-year': '2026',
        },
        {
          arrivalDate: 'The arrival date is an invalid date',
        },
      ],
      [
        'invalid departure date',
        {
          ...validBookingBody,
          'departureDate-day': '31',
          'departureDate-month': '2',
          'departureDate-year': '2026',
        },
        {
          departureDate: 'The departure date is an invalid date',
        },
      ],
      [
        'arrival date and departure date are same day',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '15',
          'departureDate-month': '5',
          'departureDate-year': '2025',
        },
        {
          departureDate: 'The departure date must be after the arrival date',
        },
      ],
      [
        'departure date is before arrival date',
        {
          'arrivalDate-day': '15',
          'arrivalDate-month': '5',
          'arrivalDate-year': '2025',
          'departureDate-day': '14',
          'departureDate-month': '5',
          'departureDate-year': '2025',
        },
        {
          departureDate: 'The departure date must be after the arrival date',
        },
      ],
    ])('with %s', (_, body, expected) => {
      expect(validateSpaceBooking(body)).toEqual(expected)
    })
  })
})
