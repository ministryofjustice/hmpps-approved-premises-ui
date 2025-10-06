import TrackProgressPage from './trackProgressPage'

describe('TrackProgressPage', () => {
  it('returns validation errors', () => {
    const page = new TrackProgressPage({})

    expect(page.validationErrors()).toEqual({
      team: { text: 'Choose a team' },
      'startDate-day': { text: 'Include the start date' },
      'endDate-day': { text: 'Include the end date' },
    })
  })

  it('returns date input items', () => {
    const page = new TrackProgressPage({
      'startDate-day': '11',
      'startDate-month': '03',
      'startDate-year': '2025',
      'endDate-day': '13',
      'endDate-month': '03',
      'endDate-year': '2025',
    })

    expect(page.items()).toEqual({
      endDateItems: [
        {
          classes: 'govuk-input--width-2',
          name: 'day',
          value: '13',
        },
        {
          classes: 'govuk-input--width-2',
          name: 'month',
          value: '03',
        },
        {
          classes: 'govuk-input--width-4',
          name: 'year',
          value: '2025',
        },
      ],
      startDateItems: [
        {
          classes: 'govuk-input--width-2',
          name: 'day',
          value: '11',
        },
        {
          classes: 'govuk-input--width-2',
          name: 'month',
          value: '03',
        },
        {
          classes: 'govuk-input--width-4',
          name: 'year',
          value: '2025',
        },
      ],
    })
  })

  it('returns date input items with error classes', () => {
    const page = new TrackProgressPage({
      'startDate-day': '11',
      'startDate-month': '03',
      'startDate-year': '2025',
    })

    expect(page.items()).toEqual({
      endDateItems: [
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'day',
          value: '',
        },
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'month',
          value: '',
        },
        {
          classes: 'govuk-input--width-4 govuk-input--error',
          name: 'year',
          value: '',
        },
      ],
      startDateItems: [
        {
          classes: 'govuk-input--width-2',
          name: 'day',
          value: '11',
        },
        {
          classes: 'govuk-input--width-2',
          name: 'month',
          value: '03',
        },
        {
          classes: 'govuk-input--width-4',
          name: 'year',
          value: '2025',
        },
      ],
    })
  })
})
