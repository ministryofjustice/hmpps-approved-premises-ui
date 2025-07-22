/* istanbul ignore file */

import CancellationsController from './cancellationsController'

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
import PlannedTransferController from './premises/changeRequests/plannedTransferController'
import PlacementAppealController from './premises/changeRequests/placementAppealController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(
    services.premisesService,
    services.cruManagementAreaService,
    services.sessionService,
  )
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
  const cancellationsController = new CancellationsController(services.cancellationService, services.placementService)
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
  const plannedTransferController = new PlannedTransferController(
    services.placementService,
    services.placementRequestService,
  )
  const placementAppealController = new PlacementAppealController(
    services.premisesService,
    services.placementRequestService,
  )

  return {
    premisesController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    outOfServiceBedCancellationController,
    cancellationsController,
    placementController,
    keyworkerController,
    apOccupancyViewController,
    changesController,
    transfersController,
    placementAppealController,
    plannedTransferController,
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
  ApOccupancyViewController,
  ChangesController,
  TransfersController,
  PlacementAppealController,
  PlannedTransferController,
}
