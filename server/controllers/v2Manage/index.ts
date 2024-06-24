/* istanbul ignore file */

import V2PremisesController from './premises/premisesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const v2PremisesController = new V2PremisesController(services.premisesService)

  return {
    v2PremisesController,
  }
}

export { V2PremisesController }
