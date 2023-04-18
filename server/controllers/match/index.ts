/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import BedSearchController from './search/bedSearchController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, bedService } = services

  const placementRequestController = new PlacementRequestController(placementRequestService)
  const bedController = new BedSearchController(bedService, placementRequestService)

  return {
    placementRequestController,
    bedController,
  }
}
