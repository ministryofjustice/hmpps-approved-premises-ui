/* istanbul ignore file */

import PlacementRequestController from './placementRequestsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService } = services

  const placementRequestController = new PlacementRequestController(placementRequestService)

  return {
    placementRequestController,
  }
}
