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
        cas1PremiseCapacityForDayFactory.build({ date: '2025-01-02', availableBedCount: 10, bookingCount: 10 }),
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
            bookableCount: 0,
            status: 'full',
            link: 'path/2025-01-02',
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

    expect(occupancyCalendar(premisesCapacity.capacity, placeholder)[0].days[0]).toEqual(
      expect.objectContaining({ link: expected }),
    )
  })

  describe('status and count for a given day', () => {
    const capacity = [
      cas1PremiseCapacityForDayFactory.build({
        date: '2025-02-02',
        totalBedCount: 20,
        availableBedCount: 18,
        bookingCount: 10,
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

    describe('when no filter criteria is provided', () => {
      it('returns without criteria count if an empty list of criteria is provided', () => {
        expect(occupancyCalendar(capacity, 'foo/:date', [])[0].days[0]).toEqual({
          date: '2025-02-02',
          name: 'Sun 2 Feb',
          bookableCount: 8,
          status: 'available',
          link: 'foo/2025-02-02',
        })
      })

      it.each([
        ['available', 10],
        ['full', 18],
        ['overbooked', 23],
      ])('returns the overall status as %s if there are %s bookings', (status, bookingCount) => {
        const overallCapacity = [
          cas1PremiseCapacityForDayFactory.build({
            ...capacity[0],
            bookingCount,
          }),
        ]

        expect(occupancyCalendar(overallCapacity, ':date', [])[0].days[0]).toEqual(
          expect.objectContaining({
            bookableCount: 18 - bookingCount,
            status,
          }),
        )
      })
    })

    describe('when a filter criteria is provided', () => {
      describe('if there is overall capacity', () => {
        it('returns with bookable count and status based on the selected criteria', () => {
          expect(occupancyCalendar(capacity, 'foo/:date', ['hasEnSuite'])[0].days[0]).toEqual(
            expect.objectContaining({
              bookableCount: 8,
              criteriaBookableCount: -1,
              status: 'overbooked',
            }),
          )

          expect(occupancyCalendar(capacity, 'foo/:date', ['isSuitedForSexOffenders'])[0].days[0]).toEqual(
            expect.objectContaining({
              bookableCount: 8,
              criteriaBookableCount: 3,
              status: 'available',
            }),
          )

          expect(occupancyCalendar(capacity, 'foo/:date', ['isWheelchairDesignated'])[0].days[0]).toEqual(
            expect.objectContaining({
              bookableCount: 8,
              criteriaBookableCount: 1,
              status: 'available',
            }),
          )

          expect(occupancyCalendar(capacity, 'foo/:date', ['isStepFreeDesignated'])[0].days[0]).toEqual(
            expect.objectContaining({
              bookableCount: 8,
              criteriaBookableCount: 0,
              status: 'full',
            }),
          )
        })

        it('returns with criteria bookable count and status based on the lowest for all criteria', () => {
          expect(
            occupancyCalendar(capacity, 'foo/:date', [
              'hasEnSuite',
              'isSuitedForSexOffenders',
              'isWheelchairDesignated',
            ])[0].days[0],
          ).toEqual(
            expect.objectContaining({
              bookableCount: 8,
              criteriaBookableCount: -1,
              status: 'overbooked',
            }),
          )
        })
      })

      describe('if there is no overall capacity but availability for the criteria', () => {
        it.each([
          ['full', 18],
          ['overbooked', 23],
        ])('returns with status %s based on overall capacity', (status, bookingCount) => {
          const overallCapacity = [
            cas1PremiseCapacityForDayFactory.build({
              ...capacity[0],
              bookingCount,
            }),
          ]

          expect(occupancyCalendar(overallCapacity, 'foo/:date', ['isSuitedForSexOffenders'])[0].days[0]).toEqual(
            expect.objectContaining({
              bookableCount: 18 - bookingCount,
              criteriaBookableCount: 3,
              status,
            }),
          )
        })
      })
    })
  })
})
