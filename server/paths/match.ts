import { path } from 'static-path'

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')
const placementRequestBookingsPath = placementRequestPath.path('bookings')

export default {
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    bookings: {
      confirm: placementRequestBookingsPath.path('confirm'),
      create: placementRequestBookingsPath,
    },
    beds: {
      search: placementRequestPath.path('beds/search'),
    },
  },
}
