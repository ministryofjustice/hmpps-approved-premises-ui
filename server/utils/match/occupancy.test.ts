import { faker } from '@faker-js/faker'
import { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { dayAvailabilityCount, dayHasAvailability, durationSelectOptions } from './occupancy'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'

const capacityWithCriteria: Cas1PremiseCapacityForDay = cas1PremiseCapacityForDayFactory.build({
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
      availableBedsCount: 1,
      bookingsCount: 1,
    }),
  ],
})

describe('dayAvailabilityCount', () => {
  it('returns the count of available spaces', () => {
    const availableBedCount = faker.number.int({ min: 1, max: 20 })
    const bookingCount = faker.number.int({ min: 1, max: 30 })
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      availableBedCount,
      bookingCount,
    })
    const expectedCount = availableBedCount - bookingCount

    expect(dayAvailabilityCount(dayCapacity)).toEqual(expectedCount)
    expect(dayAvailabilityCount(dayCapacity, [])).toEqual(expectedCount)
  })

  describe('when criteria are provided', () => {
    it('returns the count of available spaces that match the criteria', () => {
      expect(dayAvailabilityCount(capacityWithCriteria, ['hasEnSuite'])).toEqual(-1)
      expect(dayAvailabilityCount(capacityWithCriteria, ['isSuitedForSexOffenders'])).toEqual(3)
      expect(dayAvailabilityCount(capacityWithCriteria, ['isWheelchairDesignated'])).toEqual(1)
    })

    it('returns the lowest count that match any criteria', () => {
      expect(
        dayAvailabilityCount(capacityWithCriteria, ['hasEnSuite', 'isSuitedForSexOffenders', 'isWheelchairDesignated']),
      ).toEqual(-1)
    })
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

  describe('when criteria are provided', () => {
    it('returns true if the count of available spaces that match the criteria is more than 0', () => {
      expect(dayHasAvailability(capacityWithCriteria, ['isSuitedForSexOffenders'])).toEqual(true)
    })

    it('returns false if the count of available spaces that match the criteria is 0', () => {
      expect(dayHasAvailability(capacityWithCriteria, ['isStepFreeDesignated'])).toEqual(false)
    })

    it('returns false if the count of available spaces that match the criteria is less than', () => {
      expect(dayHasAvailability(capacityWithCriteria, ['hasEnSuite'])).toEqual(false)
    })

    it('returns true if the lowest count that match any criteria is more than 0', () => {
      expect(dayHasAvailability(capacityWithCriteria, ['isSuitedForSexOffenders', 'isWheelchairDesignated'])).toEqual(
        true,
      )
    })

    it('returns false if the lowest count that match any criteria is less than 0', () => {
      expect(
        dayHasAvailability(capacityWithCriteria, ['hasEnSuite', 'isSuitedForSexOffenders', 'isWheelchairDesignated']),
      ).toEqual(false)
    })
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
