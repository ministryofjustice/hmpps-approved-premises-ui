import { path } from 'static-path'

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')
const placementRequestBookingsPath = placementRequestPath.path('bookings')
const newPlacementRequestPath = placementRequestsPath.path('new')

export default {
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    create: newPlacementRequestPath,
    bookings: {
      confirm: placementRequestBookingsPath.path('confirm'),
      create: placementRequestBookingsPath,
    },
    beds: {
      search: placementRequestPath.path('beds/search'),
    },
  },
}
