/* istanbul ignore file */

import AdminPlacementRequestsController from './placementRequests/placementRequestsController'
import PlacementRequestsBookingsController from './placementRequests/bookingsController'
import PlacementRequestsWithdrawalsController from './placementRequests/withdrawalsController'
import UserManagementController from './userManagementController'
import DeliusUserController from './deliusUserController'
import ReportsController from './reportsController'
import CruDashboardController from './cruDashboardController'
import ChangeRequestsController from './placementRequests/changeRequestsController'
import NationalOccupancyController from './nationalOccupancyController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, premisesService, reportService, cruManagementAreaService, applicationService } =
    services
  const adminPlacementRequestsController = new AdminPlacementRequestsController(placementRequestService)
  const cruDashboardController = new CruDashboardController(
    placementRequestService,
    cruManagementAreaService,
    applicationService,
    premisesService,
  )
  const placementRequestsBookingsController = new PlacementRequestsBookingsController(
    placementRequestService,
    premisesService,
  )
  const placementRequestWithdrawalsController = new PlacementRequestsWithdrawalsController(placementRequestService)
  const reportsController = new ReportsController(reportService)
  const userManagementController = new UserManagementController(services.userService, cruManagementAreaService)
  const deliusUserController = new DeliusUserController(services.userService)
  const changeRequestsController = new ChangeRequestsController(
    services.placementRequestService,
    services.placementService,
  )
  const nationalOccupancyController = new NationalOccupancyController(cruManagementAreaService)

  return {
    adminPlacementRequestsController,
    cruDashboardController,
    placementRequestsBookingsController,
    placementRequestWithdrawalsController,
    reportsController,
    userManagementController,
    deliusUserController,
    changeRequestsController,
    nationalOccupancyController,
  }
}

export {
  AdminPlacementRequestsController,
  PlacementRequestsBookingsController,
  PlacementRequestsWithdrawalsController,
  ReportsController,
  DeliusUserController,
  ChangeRequestsController,
  NationalOccupancyController,
}
