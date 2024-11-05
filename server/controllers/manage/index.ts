/* istanbul ignore file */

import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import CancellationsController from './cancellationsController'
import DateChangesController from './dateChangesController'

import type { Services } from '../../services'
import PremisesController from './premises/premisesController'
import BedsController from './premises/bedsController'
import OutOfServiceBedsController from './outOfServiceBedsController'
import UpdateOutOfServiceBedsController from './updateOutOfServiceBedsController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService, services.apAreaService)
  const bedsController = new BedsController(services.premisesService)
  const outOfServiceBedsController = new OutOfServiceBedsController(
    services.outOfServiceBedService,
    services.premisesService,
    services.apAreaService,
  )
  const updateOutOfServiceBedsController = new UpdateOutOfServiceBedsController(services.outOfServiceBedService)

  const bookingsController = new BookingsController(services.bookingService)
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)
  const dateChangesController = new DateChangesController(services.bookingService)

  return {
    premisesController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    bookingsController,
    bookingExtensionsController,
    dateChangesController,
    cancellationsController,
  }
}

export {
  PremisesController,
  BedsController,
  OutOfServiceBedsController,
  UpdateOutOfServiceBedsController,
  BookingsController,
  BookingExtensionsController,
}
