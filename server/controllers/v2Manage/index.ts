/* istanbul ignore file */

import V2PremisesController from './premises/premisesController'
import V2BedsController from './premises/bedsController'
import V2OutOfServiceBedsController from './outOfServiceBedsController'
import V2UpdateOutOfServiceBedsController from './updateOutOfServiceBedsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const v2PremisesController = new V2PremisesController(services.premisesService, services.apAreaService)
  const v2BedsController = new V2BedsController(services.premisesService)
  const v2OutOfServiceBedsController = new V2OutOfServiceBedsController(
    services.outOfServiceBedService,
    services.premisesService,
    services.apAreaService,
  )
  const v2UpdateOutOfServiceBedsController = new V2UpdateOutOfServiceBedsController(
    services.outOfServiceBedService,
    services.premisesService,
  )

  return {
    v2PremisesController,
    v2BedsController,
    v2OutOfServiceBedsController,
    v2UpdateOutOfServiceBedsController,
  }
}

export { V2PremisesController, V2BedsController, V2OutOfServiceBedsController, V2UpdateOutOfServiceBedsController }
