/* istanbul ignore file */

import AdminPlacementRequestsController from './placementRequests/placementRequestsController'
import PlacementRequestsWithdrawalsController from './placementRequests/withdrawalsController'
import UserManagementController from './userManagementController'
import DeliusUserController from './deliusUserController'
import ReportsController from './reportsController'
import CruDashboardController from './cruDashboardController'
import NationalOccupancyController from './nationalOccupancyController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, premisesService, reportService, cruManagementAreaService } = services
  const adminPlacementRequestsController = new AdminPlacementRequestsController(placementRequestService)
  const cruDashboardController = new CruDashboardController(
    placementRequestService,
    cruManagementAreaService,
    premisesService,
  )
  const placementRequestWithdrawalsController = new PlacementRequestsWithdrawalsController(placementRequestService)
  const reportsController = new ReportsController(reportService)
  const userManagementController = new UserManagementController(services.userService, cruManagementAreaService)
  const deliusUserController = new DeliusUserController(services.userService)

  const nationalOccupancyController = new NationalOccupancyController(premisesService, cruManagementAreaService)

  return {
    adminPlacementRequestsController,
    cruDashboardController,
    placementRequestWithdrawalsController,
    reportsController,
    userManagementController,
    deliusUserController,
    nationalOccupancyController,
  }
}

export {
  AdminPlacementRequestsController,
  PlacementRequestsWithdrawalsController,
  ReportsController,
  DeliusUserController,
  NationalOccupancyController,
}
