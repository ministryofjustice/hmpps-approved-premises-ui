import type { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { OccupancyFilterCriteria, SelectOption } from '@approved-premises/ui'

export const dayAvailabilityCount = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<OccupancyFilterCriteria> = [],
) => {
  return criteria.length
    ? Math.min(
        ...dayCapacity.characteristicAvailability
          .filter(availability => criteria.includes(availability.characteristic as OccupancyFilterCriteria))
          .map(availability => availability.availableBedsCount - availability.bookingsCount),
      )
    : dayCapacity.availableBedCount - dayCapacity.bookingCount
}

export const dayHasAvailability = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<OccupancyFilterCriteria> = [],
) => {
  return dayAvailabilityCount(dayCapacity, criteria) > 0
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

export const occupancyCriteriaMap: Record<OccupancyFilterCriteria, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isSingle: 'Single room',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSuitedForSexOffenders: 'Suitable for sex offenders',
  isArsonSuitable: 'Designated arson room',
}
