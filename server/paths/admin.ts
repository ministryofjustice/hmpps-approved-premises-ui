import { path } from 'static-path'

const adminPath = path('/admin')
const placementRequestsPath = adminPath.path('placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

const userManagementPath = adminPath.path('user-management')

const bookingsPath = placementRequestPath.path('bookings')

const withdrawalPath = placementRequestPath.path('withdrawal')

const cruDashboardPath = adminPath.path('cru-dashboard')

export default {
  admin: {
    cruDashboard: {
      index: cruDashboardPath,
      search: cruDashboardPath.path('search'),
      downloadOccupancyReport: cruDashboardPath.path('occupancy-report'),
    },
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
    },
    reports: {
      new: adminPath.path('reports'),
      create: adminPath.path('reports'),
    },
    userManagement: {
      index: userManagementPath,
      edit: userManagementPath.path(':id'),
      update: userManagementPath.path(':id'),
      search: userManagementPath.path('search'),
      searchDelius: userManagementPath.path('search/delius'),
      confirmDelete: userManagementPath.path(':id/confirm-delete'),
      delete: userManagementPath.path(':id/delete'),
      new: userManagementPath.path('new'),
    },
  },
}
