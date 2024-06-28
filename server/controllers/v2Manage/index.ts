/* istanbul ignore file */

import V2PremisesController from './premises/premisesController'
import V2BedsController from './premises/bedsController'
import V2OutOfServiceBedsController from './outOfServiceBedsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const v2PremisesController = new V2PremisesController(services.premisesService)
  const v2BedsController = new V2BedsController(services.premisesService)
  const v2OutOfServiceBedsController = new V2OutOfServiceBedsController(services.outOfServiceBedService)

  return {
    v2PremisesController,
    v2BedsController,
    v2OutOfServiceBedsController,
  }
}

export { V2PremisesController, V2BedsController, V2OutOfServiceBedsController }
