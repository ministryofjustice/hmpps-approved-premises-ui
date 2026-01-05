import {
  Cas1SpaceBooking,
  Cas1SpaceBookingStatus,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingShortSummary,
} from '@approved-premises/api'
import { differenceInCalendarDays, parseISO } from 'date-fns'

export const overallStatusTextMap: Record<Cas1SpaceBookingStatus, string> = {
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

export type SpaceBookingStatus = keyof typeof statusTextMap

export const detailedStatus = (
  placement: Cas1SpaceBookingSummary | Cas1SpaceBooking | Cas1SpaceBookingShortSummary,
): SpaceBookingStatus => {
  const { status } = placement

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
