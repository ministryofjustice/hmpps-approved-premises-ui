import { Cas1PremiseCapacity, Cas1PremiseCapacityForDay } from '@approved-premises/api'

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
