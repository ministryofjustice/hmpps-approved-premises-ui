import { occupancyCalendar } from './occupancyCalendar'
import { cas1PremiseCapacityFactory } from '../../testutils/factories'
import { dayAvailabilityCount } from './occupancy'

describe('occupancyCalendar', () => {
  it('returns a calendar from the start date to the end date', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate: '2024-12-30', endDate: '2025-01-02' })
    expect(occupancyCalendar(premisesCapacity)).toEqual([
      {
        name: 'December 2024',
        days: [
          { name: 'Mon 30 Dec', bookableCount: dayAvailabilityCount(premisesCapacity.capacity[0]) },
          { name: 'Tue 31 Dec', bookableCount: dayAvailabilityCount(premisesCapacity.capacity[1]) },
        ],
      },
      {
        name: 'January 2025',
        days: [
          { name: 'Wed 1 Jan', bookableCount: dayAvailabilityCount(premisesCapacity.capacity[2]) },
          { name: 'Thu 2 Jan', bookableCount: dayAvailabilityCount(premisesCapacity.capacity[3]) },
        ],
      },
    ])
  })
})
