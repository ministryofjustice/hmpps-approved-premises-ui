import { faker } from '@faker-js/faker'
import { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { cas1PremiseCapacityForDayFactory } from '../../testutils/factories'
import { dayAvailabilityCount, dayAvailabilityStatusForCriteria, durationSelectOptions } from './occupancy'
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
  it('returns the count of available spaces with no or empty criteria', () => {
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

      expect(dayAvailabilityStatusForCriteria(capacityForDay)).toEqual('available')
    })

    it('returns overbooked if the day is overbooked', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.overbooked().build()

      expect(dayAvailabilityStatusForCriteria(capacityForDay)).toEqual('overbooked')
    })

    it('returns full if the day is at capacity', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.full().build()

      expect(dayAvailabilityStatusForCriteria(capacityForDay)).toEqual('full')
    })
  })

  describe('when criteria are provided', () => {
    describe('if there is general availability', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.available().build({
        characteristicAvailability: [
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSuitedForSexOffenders' }),
          premiseCharacteristicAvailability.available().build({ characteristic: 'isArsonSuitable' }),
          premiseCharacteristicAvailability.full().build({ characteristic: 'isSingle' }),
          premiseCharacteristicAvailability.overbooked().build({ characteristic: 'hasEnSuite' }),
        ],
      })

      it('returns available if there is availability for all the criteria', () => {
        expect(
          dayAvailabilityStatusForCriteria(capacityForDay, ['isSuitedForSexOffenders', 'isArsonSuitable']),
        ).toEqual('available')
      })

      it('returns full if one of the required criteria is full', () => {
        expect(dayAvailabilityStatusForCriteria(capacityForDay, ['isSingle', 'isArsonSuitable'])).toEqual('full')
      })

      it('returns overbooked if one of the required criteria is overbooked', () => {
        expect(dayAvailabilityStatusForCriteria(capacityForDay, ['isSingle', 'hasEnSuite'])).toEqual('overbooked')
      })
    })

    describe('if there is no general availability but availability for criteria', () => {
      const characteristicAvailability = [
        premiseCharacteristicAvailability.available().build({ characteristic: 'isSuitedForSexOffenders' }),
        premiseCharacteristicAvailability.available().build({ characteristic: 'isSingle' }),
      ]

      it('returns full if general availability is at capacity', () => {
        const capacity = cas1PremiseCapacityForDayFactory.full().build({
          characteristicAvailability,
        })

        expect(dayAvailabilityStatusForCriteria(capacity, ['isSingle'])).toEqual('full')
      })

      it('returns overbooked if general availability is overbooked', () => {
        const capacity = cas1PremiseCapacityForDayFactory.overbooked().build({
          characteristicAvailability,
        })

        expect(dayAvailabilityStatusForCriteria(capacity, ['hasEnSuite'])).toEqual('overbooked')
      })
    })
  })
})

describe('durationSelectOptions', () => {
  const defaultOptions = [
    { text: 'Up to 1 week', value: '7' },
    { text: 'Up to 6 weeks', value: '42' },
    { text: 'Up to 8 weeks', value: '56' },
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
    ['Up to 8 weeks', 43],
    ['Up to 8 weeks', 56],
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
