import { path } from 'static-path'

const v2MatchPath = path('/match')
const v2PlacementRequestsPath = v2MatchPath.path('placement-requests')
const v2PlacementRequestPath = v2PlacementRequestsPath.path(':placementRequestId')
const v2PlacementRequestSearchPath = v2PlacementRequestPath.path('space-search')
const v2PlacementRequestSearchOccupancyPath = v2PlacementRequestSearchPath.path('occupancy/:premisesId')
const v2SpaceBookingsPath = v2PlacementRequestPath.path('space-bookings/:premisesId')

const v2Match = {
  placementRequests: {
    search: {
      spaces: v2PlacementRequestSearchPath.path('new'),
      occupancy: v2PlacementRequestSearchOccupancyPath,
      occupancyBook: v2PlacementRequestSearchOccupancyPath.path('book'),
      dayOccupancy: v2PlacementRequestSearchOccupancyPath.path('date/:date'),
    },
    spaceBookings: {
      new: v2SpaceBookingsPath.path('new'),
      create: v2SpaceBookingsPath,
    },
  },
}

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':placementRequestId')
const bookingNotMadePath = placementRequestPath.path('booking-not-made')

export default {
  placementRequests: {
    show: placementRequestPath,
    bookingNotMade: {
      confirm: bookingNotMadePath.path('confirm'),
      create: bookingNotMadePath,
    },
  },
  v2Match,
}
