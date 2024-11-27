/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import SpaceSearchController from './search/spaceSearchController'
import BookingsController from './placementRequests/bookingsController'
import OccupancyViewController from './placementRequests/occupancyViewController'
import SpaceBookingsController from './placementRequests/spaceBookingsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementApplicationService, placementRequestService, spaceService, applicationService, premisesService } =
    services

  const placementRequestController = new PlacementRequestController(
    placementRequestService,
    placementApplicationService,
    applicationService,
  )
  const spaceSearchController = new SpaceSearchController(spaceService, placementRequestService)
  const placementRequestBookingsController = new BookingsController(placementRequestService)
  const spaceBookingsController = new SpaceBookingsController(placementRequestService, spaceService)
  const occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)

  return {
    placementRequestController,
    spaceSearchController,
    placementRequestBookingsController,
    spaceBookingsController,
    occupancyViewController,
  }
}
