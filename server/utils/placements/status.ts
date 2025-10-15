import { Cas1SpaceBooking, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { differenceInCalendarDays } from 'date-fns'

export const overallStatusTextMap = {
  upcoming: 'Upcoming',
  arrived: 'Arrived',
  notArrived: 'Not arrived',
  departed: 'Departed',
  cancelled: 'Cancelled',
} as const

export const statusTextMap = {
  ...overallStatusTextMap,
  arrivingWithin6Weeks: 'Arriving within 6 weeks',
  arrivingWithin2Weeks: 'Arriving within 2 weeks',
  arrivingToday: 'Arriving today',
  overdueArrival: 'Overdue arrival',
  departingWithin2Weeks: 'Departing within 2 weeks',
  departingToday: 'Departing today',
  overdueDeparture: 'Overdue departure',
} as const

export type SpaceBookingOverallStatus = keyof typeof overallStatusTextMap
export type SpaceBookingStatus = keyof typeof statusTextMap

const isSpaceBooking = (placement: Cas1SpaceBooking | Cas1SpaceBookingSummary): placement is Cas1SpaceBooking =>
  Boolean((placement as Cas1SpaceBooking).otherBookingsInPremisesForCrn)

export const overallStatus = (placement: Cas1SpaceBookingSummary | Cas1SpaceBooking): SpaceBookingOverallStatus => {
  const isNonArrival = isSpaceBooking(placement) ? placement.nonArrival : placement.isNonArrival
  const isCancelled = isSpaceBooking(placement) ? placement.cancellation : placement.isCancelled

  if (isCancelled) return 'cancelled'
  if (isNonArrival) return 'notArrived'
  if (placement.actualDepartureDate) return 'departed'
  if (placement.actualArrivalDate) return 'arrived'
  return 'upcoming'
}

export const detailedStatus = (placement: Cas1SpaceBookingSummary | Cas1SpaceBooking): SpaceBookingStatus => {
  const status = overallStatus(placement)

  if (['notArrived', 'departed', 'cancelled'].includes(status)) return status

  if (status === 'arrived') {
    const daysFromDeparture = differenceInCalendarDays(placement.expectedDepartureDate, new Date())

    if (daysFromDeparture < 0) return 'overdueDeparture'
    if (daysFromDeparture === 0) return 'departingToday'
    if (daysFromDeparture <= 2 * 7) return 'departingWithin2Weeks'

    return 'arrived'
  }

  const daysFromArrival = differenceInCalendarDays(placement.expectedArrivalDate, new Date())

  if (daysFromArrival < 0) return 'overdueArrival'
  if (daysFromArrival === 0) return 'arrivingToday'
  if (daysFromArrival <= 2 * 7) return 'arrivingWithin2Weeks'
  if (daysFromArrival <= 6 * 7) return 'arrivingWithin6Weeks'

  return 'upcoming'
}
