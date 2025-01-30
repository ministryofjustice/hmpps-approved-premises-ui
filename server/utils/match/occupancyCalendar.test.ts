import { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { occupancyCalendar } from './occupancyCalendar'
import { cas1PremiseCapacityFactory, cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'

describe('occupancyCalendar', () => {
  it('returns a calendar from the start date to the end date', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2024-12-30',
      endDate: '2025-01-02',
      capacity: [
        cas1PremiseCapacityForDayFactory.build({ date: '2024-12-30', availableBedCount: 10, bookingCount: 5 }),
        cas1PremiseCapacityForDayFactory.build({ date: '2024-12-31', availableBedCount: 10, bookingCount: 5 }),
        cas1PremiseCapacityForDayFactory.build({ date: '2025-01-01', availableBedCount: 10, bookingCount: 12 }),
        cas1PremiseCapacityForDayFactory.build({ date: '2025-01-02', availableBedCount: 10, bookingCount: 5 }),
      ],
    })

    expect(occupancyCalendar(premisesCapacity.capacity, 'path/:date')).toEqual([
      {
        name: 'December 2024',
        days: [
          {
            date: '2024-12-30',
            name: 'Mon 30 Dec',
            bookableCount: 5,
            status: 'available',
            link: 'path/2024-12-30',
          },
          {
            date: '2024-12-31',
            name: 'Tue 31 Dec',
            bookableCount: 5,
            status: 'available',
            link: 'path/2024-12-31',
          },
        ],
      },
      {
        name: 'January 2025',
        days: [
          {
            date: '2025-01-01',
            name: 'Wed 1 Jan',
            bookableCount: -2,
            status: 'overbooked',
            link: 'path/2025-01-01',
          },
          {
            date: '2025-01-02',
            name: 'Thu 2 Jan',
            bookableCount: 5,
            status: 'available',
            link: 'path/2025-01-02',
          },
        ],
      },
    ])
  })

  it('returns the calendar without criteria count if an empty list of criteria is provided', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2024-12-30',
      endDate: '2024-12-30',
      capacity: [
        cas1PremiseCapacityForDayFactory.build({
          date: '2024-12-30',
          availableBedCount: 10,
          bookingCount: 6,
        }),
      ],
    })

    expect(occupancyCalendar(premisesCapacity.capacity, 'foo/:date', [])).toEqual([
      {
        name: 'December 2024',
        days: [
          {
            date: '2024-12-30',
            name: 'Mon 30 Dec',
            bookableCount: 4,
            status: 'available',
            link: 'foo/2024-12-30',
          },
        ],
      },
    ])
  })

  it.each([
    ['foo/:date', 'foo/2025-02-12'],
    [':date', '2025-02-12'],
    ['foo/:date?query', 'foo/2025-02-12?query'],
    ['foo?date=:date', 'foo?date=2025-02-12'],
  ])('returns a link for each calendar day based on the placeholder URL %s', (placeholder, expected) => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2025-02-12',
      endDate: '2025-02-12',
    })

    expect(occupancyCalendar(premisesCapacity.capacity, placeholder)).toEqual([
      {
        name: 'February 2025',
        days: [expect.objectContaining({ link: expected })],
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
          premiseCharacteristicAvailability.build({
            characteristic: 'isStepFreeDesignated',
            availableBedsCount: 4,
            bookingsCount: 4,
          }),
        ],
      }),
    ]

    it('returns the calendar with bookable count for the selected criteria', () => {
      expect(occupancyCalendar(capacity, 'foo/:date', ['hasEnSuite'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: -1,
              status: 'overbooked',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacity, 'foo/:date', ['isSuitedForSexOffenders'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: 3,
              status: 'availableForCriteria',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacity, 'foo/:date', ['isWheelchairDesignated'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: 1,
              status: 'availableForCriteria',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacity, 'foo/:date', ['isStepFreeDesignated'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: 0,
              status: 'overbooked',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])
    })

    it('returns the calendar with the lowest bookable count for all criteria', () => {
      expect(
        occupancyCalendar(capacity, 'foo/:date', ['hasEnSuite', 'isSuitedForSexOffenders', 'isWheelchairDesignated']),
      ).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: -2,
              criteriaBookableCount: -1,
              status: 'overbooked',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])
    })

    it('returns the correct availability status if the day is available with and without criteria applied', () => {
      const capacityAvailable = [cas1PremiseCapacityForDayFactory.build({ ...capacity[0], bookingCount: 0 })]

      expect(occupancyCalendar(capacityAvailable, 'foo/:date', ['isSuitedForSexOffenders'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: 18,
              criteriaBookableCount: 3,
              status: 'available',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])

      expect(occupancyCalendar(capacityAvailable, 'foo/:date', ['isStepFreeDesignated'])).toEqual([
        {
          name: 'February 2025',
          days: [
            {
              date: '2025-02-02',
              name: 'Sun 2 Feb',
              bookableCount: 18,
              criteriaBookableCount: 0,
              status: 'overbooked',
              link: 'foo/2025-02-02',
            },
          ],
        },
      ])
    })
  })
})
