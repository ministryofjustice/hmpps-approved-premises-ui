import type { Cas1PremiseCapacity, Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { OccupancyFilterCriteria, SelectOption } from '@approved-premises/ui'

export const dayAvailabilityCount = (dayCapacity: Cas1PremiseCapacityForDay) => {
  return dayCapacity.availableBedCount - dayCapacity.bookingCount
}

export const dayHasAvailability = (dayCapacity: Cas1PremiseCapacityForDay) => {
  return dayAvailabilityCount(dayCapacity) > 0
}

export const dateRangeAvailability = (capacity: Cas1PremiseCapacity) => {
  const availableDays = capacity.capacity.filter(dayHasAvailability)

  if (availableDays.length === capacity.capacity.length) return 'available'
  if (availableDays.length === 0) return 'none'
  return 'partial'
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
