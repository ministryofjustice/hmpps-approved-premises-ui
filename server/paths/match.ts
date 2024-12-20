import { path } from 'static-path'

const v2MatchPath = path('/match')
const v2PlacementRequestsPath = v2MatchPath.path('placement-requests')
const v2PlacementRequestPath = v2PlacementRequestsPath.path(':id')
const v2PlacementRequestSearchPath = v2PlacementRequestPath.path('space-search')
const v2PlacementRequestSearchOccupancyPath = v2PlacementRequestSearchPath.path('occupancy/:premisesId')
const v2SpaceBookingsPath = v2PlacementRequestPath.path('space-bookings')

const v2Match = {
  placementRequests: {
    search: {
      spaces: v2PlacementRequestSearchPath.path('new'),
      occupancy: v2PlacementRequestSearchOccupancyPath,
      dayOccupancy: v2PlacementRequestSearchOccupancyPath.path('date/:date'),
    },
    spaceBookings: {
      new: v2SpaceBookingsPath.path('new'),
      create: v2SpaceBookingsPath,
    },
  },
}

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')
const placementRequestBookingsPath = placementRequestPath.path('bookings')
const newPlacementRequestPath = placementRequestsPath.path('new')
const bookingNotMadePath = placementRequestPath.path('booking-not-made')

export default {
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    create: newPlacementRequestPath,
    bookingNotMade: { confirm: bookingNotMadePath.path('confirm'), create: bookingNotMadePath },
    bookings: {
      confirm: placementRequestBookingsPath.path('confirm'),
      create: placementRequestBookingsPath,
    },
  },
  v2Match,
}
