import { faker } from '@faker-js/faker'
import { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import {
  dayAvailabilityCount,
  dayAvailabilityStatus,
  dayAvailabilitySummaryListItems,
  durationSelectOptions,
} from './occupancy'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'

const capacityWithCriteria: Cas1PremiseCapacityForDay = cas1PremiseCapacityForDayFactory.build({
  date: '2025-02-02',
  totalBedCount: 20,
  availableBedCount: 18,
  bookingCount: 21,
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

describe('dayAvailabilityStatus', () => {
  describe('when no criteria are provided', () => {
    it('returns available if there is availability', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.available().build()

      expect(dayAvailabilityStatus(capacityForDay)).toEqual('available')
    })

    it('returns overbooked if there is no availability', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.overbookedOrFull().build()

      expect(dayAvailabilityStatus(capacityForDay)).toEqual('overbooked')
    })
  })

  describe('when criteria are provided', () => {
    describe('if there is general availability', () => {
      const availableCapacity = cas1PremiseCapacityForDayFactory.available().build({
        characteristicAvailability: [
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSuitedForSexOffenders' }),
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSingle' }),
          premiseCharacteristicAvailability.overbookedOrFull().build({ characteristic: 'hasEnSuite' }),
        ],
      })

      it('returns available if there is general availability and availability for the criteria', () => {
        expect(dayAvailabilityStatus(availableCapacity, ['isSuitedForSexOffenders', 'isSingle'])).toEqual('available')
      })

      it('returns overbooked if there is no availability for the given criteria', () => {
        expect(dayAvailabilityStatus(availableCapacity, ['isSingle', 'hasEnSuite'])).toEqual('overbooked')
      })
    })

    describe('if there is no general availability but availability for criteria', () => {
      const overbookedCapacity = cas1PremiseCapacityForDayFactory.overbookedOrFull().build({
        characteristicAvailability: [
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSuitedForSexOffenders' }),
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSingle' }),
          premiseCharacteristicAvailability.overbookedOrFull().build({ characteristic: 'hasEnSuite' }),
        ],
      })

      it('returns available for criteria if there is availability for the given criteria', () => {
        expect(dayAvailabilityStatus(overbookedCapacity, ['isSingle'])).toEqual('availableForCriteria')
      })

      it('returns overbooked if there is no availability for the given criteria', () => {
        expect(dayAvailabilityStatus(overbookedCapacity, ['hasEnSuite'])).toEqual('overbooked')
      })
    })
  })
})

describe('dayAvailabilitySummaryListItems', () => {
  describe('when no criteria are provided', () => {
    it('returns a summary list with main availability for the day', () => {
      const summaryList = dayAvailabilitySummaryListItems(capacityWithCriteria)

      expect(summaryList).toEqual([
        { key: { text: 'AP capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '21' } },
        { key: { text: 'Available spaces' }, value: { text: '-3' } },
      ])
    })
  })

  describe('when criteria are provided', () => {
    it('returns a summary list with detailed availability for the selected criteria', () => {
      const summaryList = dayAvailabilitySummaryListItems(capacityWithCriteria, [
        'isSuitedForSexOffenders',
        'isStepFreeDesignated',
      ])

      expect(summaryList).toEqual([
        { key: { text: 'AP capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '21' } },
        { key: { text: 'Suitable for sex offenders spaces available' }, value: { text: '3' } },
        { key: { text: 'Step-free spaces available' }, value: { text: '0' } },
      ])
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
