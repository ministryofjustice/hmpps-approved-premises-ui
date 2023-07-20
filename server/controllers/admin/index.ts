/* istanbul ignore file */

import AdminPlacementRequestsController from './placementRequestsController'
import PlacementRequestsBookingsController from './placementRequests/bookingsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, premisesService } = services
  const adminPlacementRequestsController = new AdminPlacementRequestsController(placementRequestService)
  const placementRequestsBookingsController = new PlacementRequestsBookingsController(
    placementRequestService,
    premisesService,
  )

  return {
    adminPlacementRequestsController,
    placementRequestsBookingsController,
  }
}

export { AdminPlacementRequestsController, PlacementRequestsBookingsController }
