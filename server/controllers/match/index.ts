/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import BedSearchController from './search/bedSearchController'
import BookingsController from './placementRequests/bookingsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementApplicationService, placementRequestService, bedService, taskService } = services

  const placementRequestController = new PlacementRequestController(
    placementRequestService,
    placementApplicationService,
    taskService,
  )
  const bedController = new BedSearchController(bedService, placementRequestService)
  const placementRequestBookingsController = new BookingsController(placementRequestService)

  return {
    placementRequestController,
    bedController,
    placementRequestBookingsController,
  }
}
