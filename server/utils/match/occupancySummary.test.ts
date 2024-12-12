import { cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { occupancySummary } from './occupancySummary'

describe('occupancySummary', () => {
  it('returns a list of available and overbooked time periods', () => {
    const capacity = [
      cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-12' }),
      cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-13' }),
      cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-14' }),
      cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-15' }),
      cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-02-16' }),
      cas1PremiseCapacityForDayFactory.available().build({ date: '2025-02-17' }),
    ]

    const result = occupancySummary(capacity)

    expect(result).toEqual({
      available: [
        { from: '2025-02-12', to: '2025-02-13', duration: 2 },
        { from: '2025-02-17', duration: 1 },
      ],
      overbooked: [{ from: '2025-02-14', to: '2025-02-16', duration: 3 }],
    })
  })

  it('returns only overbooked if no dates are available', () => {
    const capacity = [cas1PremiseCapacityForDayFactory.overbooked().build({ date: '2025-04-14' })]

    const result = occupancySummary(capacity)

    expect(result).toEqual({
      overbooked: [{ from: '2025-04-14', duration: 1 }],
    })
  })

  it('returns only available if no dates are overbooked', () => {
    const capacity = [cas1PremiseCapacityForDayFactory.available().build({ date: '2025-04-15' })]

    const result = occupancySummary(capacity)

    expect(result).toEqual({
      available: [{ from: '2025-04-15', duration: 1 }],
    })
  })
})
