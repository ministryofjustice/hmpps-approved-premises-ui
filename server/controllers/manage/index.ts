/* istanbul ignore file */

import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import CancellationsController from './cancellationsController'
import DateChangesController from './dateChangesController'

import type { Services } from '../../services'
import PremisesController from './premises/premisesController'
import ApOccupancyViewController from './premises/apOccupancyViewController'
import PlacementController from './placementController'
import BedsController from './premises/bedsController'
import OutOfServiceBedsController from './outOfServiceBeds/outOfServiceBedsController'
import UpdateOutOfServiceBedsController from './outOfServiceBeds/updateOutOfServiceBedsController'
import OutOfServiceBedCancellationController from './outOfServiceBeds/outOfServiceBedCancellationController'
import ArrivalsController from './premises/placements/arrivalsController'
import NonArrivalsController from './premises/placements/nonArrivalsController'
import KeyworkerController from './premises/placements/keyworkerController'
import DeparturesController from './premises/placements/departuresController'
import ChangesController from './premises/placements/changesController'
import TransfersController from './premises/placements/transfersController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService, services.apAreaService)
  const bedsController = new BedsController(services.premisesService)
  const outOfServiceBedsController = new OutOfServiceBedsController(
    services.outOfServiceBedService,
    services.premisesService,
    services.apAreaService,
    services.sessionService,
  )
  const updateOutOfServiceBedsController = new UpdateOutOfServiceBedsController(services.outOfServiceBedService)
  const outOfServiceBedCancellationController = new OutOfServiceBedCancellationController(
    services.outOfServiceBedService,
  )
  const bookingsController = new BookingsController(services.bookingService)
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const cancellationsController = new CancellationsController(
    services.cancellationService,
    services.bookingService,
    services.placementService,
  )
  const dateChangesController = new DateChangesController(services.bookingService)
  const placementController = new PlacementController(
    services.applicationService,
    services.assessmentService,
    services.placementRequestService,
    services.placementService,
    services.premisesService,
    services.sessionService,
  )
  const arrivalsController = new ArrivalsController(services.premisesService, services.placementService)
  const nonArrivalsController = new NonArrivalsController(services.premisesService, services.placementService)
  const keyworkerController = new KeyworkerController(services.premisesService, services.placementService)
  const departuresController = new DeparturesController(services.premisesService, services.placementService)
  const apOccupancyViewController = new ApOccupancyViewController(services.premisesService, services.sessionService)
  const changesController = new ChangesController(services.placementService, services.premisesService)
  const transfersController = new TransfersController(services.placementService, services.premisesService)

  return {
    premisesController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    outOfServiceBedCancellationController,
    bookingsController,
    bookingExtensionsController,
    dateChangesController,
    cancellationsController,
    placementController,
    keyworkerController,
    apOccupancyViewController,
    changesController,
    transfersController,
  }
}

export {
  PremisesController,
  PlacementController,
  ArrivalsController,
  NonArrivalsController,
  DeparturesController,
  KeyworkerController,
  BedsController,
  OutOfServiceBedsController,
  UpdateOutOfServiceBedsController,
  OutOfServiceBedCancellationController,
  BookingsController,
  BookingExtensionsController,
  ApOccupancyViewController,
  ChangesController,
  TransfersController,
}
