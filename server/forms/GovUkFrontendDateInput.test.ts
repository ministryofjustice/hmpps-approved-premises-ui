import GovukFrontendDateInput from './GovukFrontendDateInput'

describe('GovUkFrontendDateInput', () => {
  it('has expected items if dates with key exist', () => {
    const query = {
      'date-day': '09',
      'date-month': '10',
      'date-year': '2025',
      'another-day': '22',
    }

    const input = new GovukFrontendDateInput(query, 'date')

    expect(input.items).toEqual([
      {
        name: 'day',
        classes: 'govuk-input--width-2',
        value: '09',
      },
      {
        name: 'month',
        classes: 'govuk-input--width-2',
        value: '10',
      },
      {
        name: 'year',
        classes: 'govuk-input--width-4',
        value: '2025',
      },
    ])
  })

  it('has items with empty value if date with key does not exist', () => {
    const query = {
      'another-day': '22',
      'another-month': '23',
      'another-year': '24',
    }

    const input = new GovukFrontendDateInput(query, 'date')

    expect(input.items).toEqual([
      {
        name: 'day',
        classes: 'govuk-input--width-2',
        value: '',
      },
      {
        name: 'month',
        classes: 'govuk-input--width-2',
        value: '',
      },
      {
        name: 'year',
        classes: 'govuk-input--width-4',
        value: '',
      },
    ])
  })

  it('includes error styles when `hasError` is true', () => {
    const query = {
      'date-day': '09',
      'date-month': '10',
      'date-year': '2025',
      'another-day': '22',
    }

    const hasError = true
    const input = new GovukFrontendDateInput(query, 'date', hasError)

    expect(input.items).toEqual([
      {
        name: 'day',
        classes: 'govuk-input--width-2 govuk-input--error',
        value: '09',
      },
      {
        name: 'month',
        classes: 'govuk-input--width-2 govuk-input--error',
        value: '10',
      },
      {
        name: 'year',
        classes: 'govuk-input--width-4 govuk-input--error',
        value: '2025',
      },
    ])
  })
})
