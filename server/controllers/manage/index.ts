/* istanbul ignore file */

import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import ArrivalsController from './arrivalsController'
import NonArrivalsController from './nonArrivalsController'
import DeparturesController from './departuresController'
import CancellationsController from './cancellationsController'
import MoveBedsController from './moveBedsController'
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

  const bookingsController = new BookingsController(services.bookingService, services.personService)
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService, services.premisesService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(services.departureService, services.bookingService)
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)
  const moveBedsController = new MoveBedsController(services.bookingService, services.premisesService)
  const dateChangesController = new DateChangesController(services.bookingService)

  return {
    premisesController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    bookingsController,
    bookingExtensionsController,
    dateChangesController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    moveBedsController,
  }
}

export {
  PremisesController,
  BedsController,
  OutOfServiceBedsController,
  UpdateOutOfServiceBedsController,
  BookingsController,
  BookingExtensionsController,
  ArrivalsController,
  NonArrivalsController,
  DeparturesController,
  MoveBedsController,
}
