import { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { SelectOption, SummaryListItem } from '@approved-premises/ui'

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

export const dayAvailabilityStatusMap: Record<DayAvailabilityStatus, string> = {
  available: 'Available',
  availableForCriteria: 'Available for your criteria',
  overbooked: 'Overbooked',
}

export const dayAvailabilitySummaryListItems = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
): Array<SummaryListItem> => {
  const rows = [
    { key: { text: 'AP capacity' }, value: { text: `${dayCapacity.totalBedCount}` } },
    { key: { text: 'Booked spaces' }, value: { text: `${dayCapacity.bookingCount}` } },
  ]

  if (!criteria.length) {
    rows.push({ key: { text: 'Available spaces' }, value: { text: `${dayAvailabilityCount(dayCapacity)}` } })
  } else {
    criteria.forEach(criterion => {
      const dayCharacteristic = dayCapacity.characteristicAvailability.find(
        characteristic => characteristic.characteristic === criterion,
      )

      rows.push({
        key: { text: `${occupancyCriteriaMap[criterion]} spaces available` },
        value: { text: `${dayCharacteristic.availableBedsCount - dayCharacteristic.bookingsCount}` },
      })
    })
  }

  return rows
}

const durationOptionsMap: Record<number, string> = {
  '7': 'Up to 1 week',
  '42': 'Up to 6 weeks',
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
  isSingle: 'Single room',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSuitedForSexOffenders: 'Suitable for sex offenders',
  isArsonSuitable: 'Designated arson room',
}
