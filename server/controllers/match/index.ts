/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import BedSearchController from './bedSearchController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, bedService, personService } = services

  const placementRequestController = new PlacementRequestController(placementRequestService)
  const bedController = new BedSearchController(bedService, personService)

  return {
    placementRequestController,
    bedController,
  }
}
