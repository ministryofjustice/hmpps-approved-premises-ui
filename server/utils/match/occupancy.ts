import { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { SelectOption } from '@approved-premises/ui'

export const dayAvailabilityCount = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
) => {
  return criteria.length
    ? Math.min(
        ...dayCapacity.characteristicAvailability
          .filter(availability => criteria.includes(availability.characteristic as Cas1SpaceBookingCharacteristic))
          .map(availability => availability.availableBedsCount - availability.bookingsCount),
      )
    : dayCapacity.availableBedCount - dayCapacity.bookingCount
}

export type DayAvailabilityStatus = 'available' | 'availableForCriteria' | 'overbooked'

export const dayAvailabilityStatus = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
): DayAvailabilityStatus => {
  let status: DayAvailabilityStatus =
    dayCapacity.availableBedCount > dayCapacity.bookingCount ? 'available' : 'overbooked'

  if (criteria.length) {
    const criteriaBookableCount = dayAvailabilityCount(dayCapacity, criteria)

    if (criteriaBookableCount > 0 && status === 'overbooked') {
      status = 'availableForCriteria'
    } else if (criteriaBookableCount <= 0) {
      status = 'overbooked'
    }
  }
  return status
}

export const dayAvailabilityStatusMap: Record<DayAvailabilityStatus, { title: string; detail: string }> = {
  available: { title: 'Available', detail: 'The space you require is available.' },
  availableForCriteria: {
    title: 'Available for your criteria',
    detail:
      'This AP is full or overbooked, but the space you require is available as it is occupied by someone who does not need it.',
  },
  overbooked: { title: 'Overbooked', detail: 'This AP is full or overbooked. The space you require is not available.' },
}

const durationOptionsMap: Record<number, string> = {
  '7': 'Up to 1 week',
  '42': 'Up to 6 weeks',
  '56': 'Up to 8 weeks',
  '84': 'Up to 12 weeks',
  '182': 'Up to 26 weeks',
  '364': 'Up to 52 weeks',
}

export const durationSelectOptions = (duration?: number): Array<SelectOption> => {
  let selected: string

  if (duration) {
    const values = Object.keys(durationOptionsMap)
    selected = String(values.filter(value => Number(value) >= duration)[0] || values.slice(-1))
  }

  return Object.entries(durationOptionsMap).map(([value, label]) => ({
    value,
    text: label,
    selected: selected === value || undefined,
  }))
}

export const occupancyCriteriaMap: Record<Cas1SpaceBookingCharacteristic, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSingle: 'Single room',
  isArsonSuitable: 'Suitable for active arson risk',
  isSuitedForSexOffenders: 'Suitable for sexual offence risk',
}
