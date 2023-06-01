/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import BedSearchController from './search/bedSearchController'
import BookingsController from './placementRequests/bookingsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, bedService } = services

  const placementRequestController = new PlacementRequestController(placementRequestService)
  const bedController = new BedSearchController(bedService, placementRequestService)
  const placementRequestBookingsController = new BookingsController(placementRequestService)

  return {
    placementRequestController,
    bedController,
    placementRequestBookingsController,
  }
}
