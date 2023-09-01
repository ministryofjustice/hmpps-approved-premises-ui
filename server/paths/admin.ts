import { path } from 'static-path'

const adminPath = path('/admin')
const placementRequestsPath = adminPath.path('placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

const userManagementPath = adminPath.path('user-mangement')

const bookingsPath = placementRequestPath.path('bookings')

const withdrawalPath = placementRequestPath.path('withdrawal')

const unableToMatchPath = placementRequestPath.path('unable-to-match')

export default {
  admin: {
    placementRequests: {
      index: placementRequestsPath,
      search: placementRequestsPath.path('search'),
      show: placementRequestPath,
      bookings: {
        new: bookingsPath.path('new'),
        create: bookingsPath,
      },
      withdrawal: {
        new: withdrawalPath.path('new'),
        create: withdrawalPath,
      },
      unableToMatch: {
        new: unableToMatchPath.path('new'),
        create: unableToMatchPath,
      },
    },
    reports: {
      new: adminPath.path('reports'),
      create: adminPath.path('reports'),
    },
    userManagement: {
      index: userManagementPath,
      show: userManagementPath.path(':id'),
      search: userManagementPath.path('search'),
    },
  },
}
