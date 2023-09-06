/* istanbul ignore file */

import AdminPlacementRequestsController from './placementRequests/placementRequestsController'
import PlacementRequestsBookingsController from './placementRequests/bookingsController'
import PlacementRequestsWithdrawalsController from './placementRequests/withdrawalsController'
import PlacementRequestUnableToMatchController from './placementRequests/unableToMatchController'
import UserManagementController from './userManagementController'
import ReportsController from './reportsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, premisesService, reportService } = services
  const adminPlacementRequestsController = new AdminPlacementRequestsController(placementRequestService)
  const placementRequestsBookingsController = new PlacementRequestsBookingsController(
    placementRequestService,
    premisesService,
  )
  const placementRequestWithdrawalsController = new PlacementRequestsWithdrawalsController(placementRequestService)
  const reportsController = new ReportsController(reportService)
  const placementRequestUnableToMatchController = new PlacementRequestUnableToMatchController(placementRequestService)
  const userManagementController = new UserManagementController(services.userService)

  return {
    adminPlacementRequestsController,
    placementRequestsBookingsController,
    placementRequestWithdrawalsController,
    reportsController,
    placementRequestUnableToMatchController,
    userManagementController,
  }
}

export {
  AdminPlacementRequestsController,
  PlacementRequestsBookingsController,
  PlacementRequestUnableToMatchController,
  PlacementRequestsWithdrawalsController,
  ReportsController,
}
