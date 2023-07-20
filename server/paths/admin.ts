import { path } from 'static-path'

const adminPath = path('/admin')
const placementRequestsPath = adminPath.path('placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

const bookingsPath = placementRequestPath.path('bookings')

export default {
  admin: {
    placementRequests: {
      index: placementRequestsPath,
      show: placementRequestPath,
      bookings: {
        new: bookingsPath.path('new'),
        create: bookingsPath,
      },
    },
  },
}
