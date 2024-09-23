/* istanbul ignore file */

import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import ArrivalsController from './arrivalsController'
import NonArrivalsController from './nonArrivalsController'
import DeparturesController from './departuresController'
import CancellationsController from './cancellationsController'
import LostBedsController from './lostBedsController'
import MoveBedsController from './moveBedsController'
import DateChangesController from './dateChangesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const bookingsController = new BookingsController(services.bookingService, services.personService)
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService, services.premisesService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(services.departureService, services.bookingService)
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)
  const lostBedsController = new LostBedsController(services.lostBedService)
  const moveBedsController = new MoveBedsController(services.bookingService, services.premisesService)
  const dateChangesController = new DateChangesController(services.bookingService)

  return {
    bookingsController,
    bookingExtensionsController,
    dateChangesController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    lostBedsController,
    moveBedsController,
  }
}

export {
  BookingsController,
  BookingExtensionsController,
  ArrivalsController,
  NonArrivalsController,
  DeparturesController,
  MoveBedsController,
}
