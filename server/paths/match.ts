import { path } from 'static-path'

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
    beds: {
      search: placementRequestPath.path('beds/search'),
    },
  },
}
