/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import SpaceSearchController from './search/spaceSearchController'
import BookingsController from './placementRequests/bookingsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementApplicationService, placementRequestService, spaceService, applicationService } = services

  const placementRequestController = new PlacementRequestController(
    placementRequestService,
    placementApplicationService,
    applicationService,
  )
  const spaceSearchController = new SpaceSearchController(spaceService, placementRequestService)
  const placementRequestBookingsController = new BookingsController(placementRequestService)

  return {
    placementRequestController,
    spaceSearchController,
    placementRequestBookingsController,
  }
}
