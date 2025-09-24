import { path } from 'static-path'

const adminPath = path('/admin')
const placementRequestsPath = adminPath.path('placement-requests')
const placementRequestPath = placementRequestsPath.path(':placementRequestId')
const changeRequestPath = placementRequestPath.path('change-requests/:changeRequestId')

const userManagementPath = adminPath.path('user-management')

const withdrawalPath = placementRequestPath.path('withdrawal')

const cruDashboardPath = adminPath.path('cru-dashboard')

const nationalOccupancyPath = adminPath.path('national-occupancy')

const nationalOccupancyPremisesPath = nationalOccupancyPath.path('premises/:premisesId')

export default {
  admin: {
    cruDashboard: {
      index: cruDashboardPath,
      changeRequests: cruDashboardPath.path('change-requests'),
      search: cruDashboardPath.path('search'),
      downloadOccupancyReport: cruDashboardPath.path('occupancy-report'),
    },
    nationalOccupancy: {
      weekView: nationalOccupancyPath,
      premisesView: nationalOccupancyPremisesPath,
      premisesDayView: nationalOccupancyPremisesPath.path('date/:date'),
    },
    placementRequests: {
      index: placementRequestsPath,
      search: placementRequestsPath.path('search'),
      show: placementRequestPath,
      withdrawal: {
        new: withdrawalPath.path('new'),
        create: withdrawalPath,
      },
      changeRequests: {
        review: changeRequestPath.path('review'),
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
      searchDelius: userManagementPath.path('search/delius'),
      confirmDelete: userManagementPath.path(':id/confirm-delete'),
      delete: userManagementPath.path(':id/delete'),
      new: userManagementPath.path('new'),
    },
  },
}
