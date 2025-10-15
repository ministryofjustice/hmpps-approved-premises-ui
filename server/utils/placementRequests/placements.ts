import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { overallStatus, SpaceBookingOverallStatus } from '../placements/status'

export const getPlacementOfStatus = (
  status: SpaceBookingOverallStatus,
  placementRequest: Cas1PlacementRequestDetail,
): Cas1SpaceBookingSummary =>
  placementRequest.spaceBookings
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .find(booking => overallStatus(booking) === status)
