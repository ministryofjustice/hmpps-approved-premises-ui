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

export type DayAvailabilityStatus = 'available' | 'full' | 'overbooked'

export const dayAvailabilityStatus = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
): DayAvailabilityStatus => {
  let status: DayAvailabilityStatus = 'available'

  if (dayCapacity.availableBedCount === dayCapacity.bookingCount) status = 'full'
  if (dayCapacity.availableBedCount < dayCapacity.bookingCount) status = 'overbooked'

  if (criteria.length) {
    const criteriaBookableCount = dayAvailabilityCount(dayCapacity, criteria)

    if (criteriaBookableCount < 0) {
      status = 'overbooked'
    } else if (criteriaBookableCount === 0 && status !== 'overbooked') {
      status = 'full'
    }
  }

  return status
}

export const dayAvailabilityStatusMap: Record<DayAvailabilityStatus, { title: string; detail: string }> = {
  available: { title: 'Available', detail: 'The space you require is available.' },
  full: { title: 'Full', detail: 'This AP is full. The space your require is not available.' },
  overbooked: { title: 'Overbooked', detail: 'This AP is overbooked. The space you require is not available.' },
}

const durationOptionsMap: Record<number, string> = {
  '7': 'Up to 1 week',
  '42': 'Up to 6 weeks',
  '56': 'Up to 8 weeks',
  '84': 'Up to 12 weeks',
  '182': 'Up to 26 weeks',
  '364': 'Up to 52 weeks',
}

export const getClosestDuration = (duration: number): number => {
  const values = Object.keys(durationOptionsMap)
  return duration && Number(values.filter(value => Number(value) >= duration)[0] || values.slice(-1))
}

export const durationSelectOptions = (duration?: number): Array<SelectOption> => {
  const selected: string = String(getClosestDuration(duration))

  return Object.entries(durationOptionsMap).map(([value, label]) => ({
    value,
    text: label,
    selected: selected === value || undefined,
  }))
}
