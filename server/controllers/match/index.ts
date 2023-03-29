/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'
import BedController from './bedsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService, bedService, personService } = services

  const placementRequestController = new PlacementRequestController(placementRequestService)
  const bedController = new BedController(bedService, personService)

  return {
    placementRequestController,
    bedController,
  }
}
