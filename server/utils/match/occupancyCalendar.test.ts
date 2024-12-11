import { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { occupancyCalendar } from './occupancyCalendar'
import { cas1PremiseCapacityFactory, cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { dayAvailabilityCount } from './occupancy'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'

describe('occupancyCalendar', () => {
  it('returns a calendar from the start date to the end date', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate: '2024-12-30', endDate: '2025-01-02' })

    expect(occupancyCalendar(premisesCapacity.capacity)).toEqual([
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

  it('returns the calendar without criteria count if an empty list of criteria is provided', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate: '2024-12-30', endDate: '2024-12-30' })

    expect(occupancyCalendar(premisesCapacity.capacity, [])).toEqual([
      {
        name: 'December 2024',
        days: [{ name: 'Mon 30 Dec', bookableCount: dayAvailabilityCount(premisesCapacity.capacity[0]) }],
      },
    ])
  })

  describe('when a filter criteria is provided', () => {
    const capacity: Array<Cas1PremiseCapacityForDay> = [
      cas1PremiseCapacityForDayFactory.build({
        date: '2025-02-02',
        totalBedCount: 20,
        availableBedCount: 18,
        bookingCount: 20,
        characteristicAvailability: [
          premiseCharacteristicAvailability.build({
            characteristic: 'hasEnSuite',
            availableBedsCount: 1,
            bookingsCount: 2,
          }),
          premiseCharacteristicAvailability.build({
            characteristic: 'isSuitedForSexOffenders',
            availableBedsCount: 5,
            bookingsCount: 2,
          }),
          premiseCharacteristicAvailability.build({
            characteristic: 'isWheelchairDesignated',
            availableBedsCount: 2,
            bookingsCount: 1,
          }),
        ],
      }),
    ]

    it('returns the calendar with bookable count for the selected criteria', () => {
      expect(occupancyCalendar(capacity, ['hasEnSuite'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: -1,
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacity, ['isSuitedForSexOffenders'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: 3,
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacity, ['isWheelchairDesignated'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: 1,
            },
          ],
        },
      ])
    })

    it('returns the calendar with the lowest bookable count for all criteria', () => {
      expect(occupancyCalendar(capacity, ['hasEnSuite', 'isSuitedForSexOffenders', 'isWheelchairDesignated'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: -1,
            },
          ],
        },
      ])
    })
  })
})
