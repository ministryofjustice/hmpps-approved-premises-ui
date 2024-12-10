import { faker } from '@faker-js/faker'
import { cas1PremiseCapacityFactory, cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { dateRangeAvailability, dayAvailabilityCount, dayHasAvailability, durationSelectOptions } from './occupancy'

describe('dayAvailabilityCount', () => {
  it('returns the count of available spaces for the day', () => {
    const availableBedCount = faker.number.int({ min: 1, max: 20 })
    const bookingCount = faker.number.int({ min: 1, max: 30 })
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      availableBedCount,
      bookingCount,
    })

    expect(dayAvailabilityCount(dayCapacity)).toEqual(availableBedCount - bookingCount)
  })
})

describe('dayHasAvailability', () => {
  it('returns true if the day has availability', () => {
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      availableBedCount: 15,
      bookingCount: 10,
    })

    expect(dayHasAvailability(dayCapacity)).toBe(true)
  })

  it('returns false if the day is overbooked', () => {
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      availableBedCount: 15,
      bookingCount: 20,
    })

    expect(dayHasAvailability(dayCapacity)).toBe(false)
  })

  it('returns false if the day is fully booked', () => {
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      availableBedCount: 15,
      bookingCount: 15,
    })

    expect(dayHasAvailability(dayCapacity)).toBe(false)
  })
})

describe('dateRangeAvailability', () => {
  it('returns "available" if all dates have availability', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2024-12-05',
      endDate: '2024-12-05',
      capacity: [
        cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 15,
          bookingCount: 0,
        }),
      ],
    })

    expect(dateRangeAvailability(premisesCapacity)).toEqual('available')
  })

  it('returns "partial" if only some of the dates have availability', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2024-12-05',
      endDate: '2024-12-05',
      capacity: [
        cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 15,
          bookingCount: 0,
        }),
        cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 15,
          bookingCount: 20,
        }),
      ],
    })

    expect(dateRangeAvailability(premisesCapacity)).toEqual('partial')
  })

  it('returns "none" if none of the dates have availability', () => {
    const premisesCapacity = cas1PremiseCapacityFactory.build({
      startDate: '2024-12-05',
      endDate: '2024-12-05',
      capacity: [
        cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 15,
          bookingCount: 20,
        }),
      ],
    })

    expect(dateRangeAvailability(premisesCapacity)).toEqual('none')
  })
})

describe('durationSelectOptions', () => {
  const defaultOptions = [
    { text: 'Up to 1 week', value: '7' },
    { text: 'Up to 6 weeks', value: '42' },
    { text: 'Up to 12 weeks', value: '84' },
    { text: 'Up to 26 weeks', value: '182' },
    { text: 'Up to 52 weeks', value: '364' },
  ]

  it('returns a list of duration options', () => {
    expect(durationSelectOptions()).toEqual(defaultOptions)
  })

  it.each([
    ['Up to 1 week', 3],
    ['Up to 1 week', 7],
    ['Up to 6 weeks', 42],
    ['Up to 12 weeks', 80],
    ['Up to 12 weeks', 84],
    ['Up to 26 weeks', 85],
    ['Up to 26 weeks', 182],
    ['Up to 52 weeks', 183],
    ['Up to 52 weeks', 500],
  ])('selects the option "%s" for a duration of %s days', (selectedLabel, duration) => {
    const result = durationSelectOptions(duration)

    expect(result.find(option => option.selected === true).text).toEqual(selectedLabel)
  })
})
