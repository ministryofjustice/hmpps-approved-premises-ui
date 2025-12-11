import { Cas1PlacementRequestDetail, Cas1SpaceBookingStatus, Cas1SpaceBookingSummary } from '@approved-premises/api'

export const getPlacementOfStatus = (
  status: Cas1SpaceBookingStatus,
  placementRequest: Cas1PlacementRequestDetail,
): Cas1SpaceBookingSummary =>
  placementRequest.spaceBookings
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .find(booking => booking.status === status)
