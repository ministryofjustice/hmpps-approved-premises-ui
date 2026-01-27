/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import SpaceSearchController from './search/spaceSearchController'
import BookingsController from './placementRequests/bookingsController'
import OccupancyViewController from './placementRequests/occupancyViewController'
import SpaceBookingsController from './placementRequests/spaceBookingsController'

import type { Services } from '../../services'
import NewPlacementController from './newPlacement/newPlacementController'

export const controllers = (services: Services) => {
  const {
    placementApplicationService,
    placementRequestService,
    spaceSearchService,
    applicationService,
    premisesService,
    sessionService,
    placementService,
  } = services

  const placementRequestController = new PlacementRequestController(
    placementRequestService,
    placementApplicationService,
    applicationService,
  )
  const spaceSearchController = new SpaceSearchController(spaceSearchService, placementRequestService)
  const placementRequestBookingsController = new BookingsController(placementRequestService, sessionService)
  const spaceBookingsController = new SpaceBookingsController(
    placementRequestService,
    premisesService,
    spaceSearchService,
  )
  const occupancyViewController = new OccupancyViewController(
    placementRequestService,
    premisesService,
    placementService,
  )
  const newPlacementController = new NewPlacementController(placementRequestService)

  return {
    placementRequestController,
    spaceSearchController,
    placementRequestBookingsController,
    spaceBookingsController,
    occupancyViewController,
    newPlacementController,
  }
}
