import { cas1PremiseCapacityFactory, cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { DateRange, occupancySummary, renderDateRange } from './occupancySummary'

describe('occupancySummary', () => {
  it('returns a list of available and overbooked time periods', () => {
    const capacity = cas1PremiseCapacityFactory.build({
      capacity: [
        cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-12' }),
        cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-13' }),
        cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-14' }),
        cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-15' }),
        cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-16' }),
        cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-17' }),
      ],
    })
    const result = occupancySummary(capacity)

    expect(result).toMatchStringIgnoringWhitespace(`
      <div style="max-width: 100%">
        <h3 class="govuk-heading-m">Available on:</h3>
        <ul>
          <li>Wed 12 Feb 2025 to Thu 13 Feb 2025 <strong>(2 days)</strong></li>
          <li>Mon 17 Feb 2025 <strong>(1 day)</strong></li>
        </ul>
        <h3 class="govuk-heading-m">Overbooked on:</h3>
        <ul>
          <li>Fri 14 Feb 2025 to Sun 16 Feb 2025 <strong>(3 days)</strong></li>
        </ul>
      </div>
    `)
  })

  it('returns null for available if no dates are available', () => {
    const capacity = cas1PremiseCapacityFactory.build({
      capacity: [cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-04-14' })],
    })
    const result = occupancySummary(capacity)

    expect(result).toMatchStringIgnoringWhitespace(
      `<p class="govuk-heading-m">There are no spaces available for the dates you have selected.</p>`,
    )
  })

  it('returns null for overbooked if no dates are overbooked', () => {
    const capacity = cas1PremiseCapacityFactory.build({
      capacity: [cas1PremiseCapacityForDayFactory.available().build({ date: '2025-04-15' })],
    })
    const result = occupancySummary(capacity)

    expect(result).toMatchStringIgnoringWhitespace(
      `<p class="govuk-heading-m">The placement dates you have selected are available.</p>`,
    )
  })

  describe('renderDateRange', () => {
    it.each([
      ['1 day', { start: '2024-12-04', end: '2024-12-04' }, 'Wed 4 Dec 2024 <strong>(1 day)</strong>'],
      [
        '3 days',
        {
          start: '2024-12-04',
          end: '2024-12-06',
        },
        'Wed 4 Dec 2024 to Fri 6 Dec 2024 <strong>(3 days)</strong>',
      ],
      [
        '1 week',
        {
          start: '2024-12-04',
          end: '2024-12-10',
        },
        'Wed 4 Dec 2024 to Tue 10 Dec 2024 <strong>(1 week)</strong>',
      ],
      [
        '1 week and 4 days',
        {
          start: '2024-12-04',
          end: '2024-12-14',
        },
        'Wed 4 Dec 2024 to Sat 14 Dec 2024 <strong>(1 week and 4 days)</strong>',
      ],
      [
        '3 weeks and 1 day',
        {
          start: '2024-12-04',
          end: '2024-12-25',
        },
        'Wed 4 Dec 2024 to Wed 25 Dec 2024 <strong>(3 weeks and 1 day)</strong>',
      ],
    ])('renders a date range spanning %s', (_, dateRange: DateRange, expected) => {
      expect(renderDateRange(dateRange)).toEqual(expected)
    })
  })
})
