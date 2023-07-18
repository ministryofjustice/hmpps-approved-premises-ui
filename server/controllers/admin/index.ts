/* istanbul ignore file */

import AdminPlacementRequestsController from './placementRequestsController'
import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { placementRequestService } = services
  const adminPlacementRequestsController = new AdminPlacementRequestsController(placementRequestService)

  return {
    adminPlacementRequestsController,
  }
}

export { AdminPlacementRequestsController }
