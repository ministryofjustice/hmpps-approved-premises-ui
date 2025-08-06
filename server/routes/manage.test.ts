import { Router } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import {
  ApOccupancyViewController,
  ArrivalsController,
  BedsController,
  ChangesController,
  DeparturesController,
  KeyworkerController,
  NonArrivalsController,
  OutOfServiceBedCancellationController,
  OutOfServiceBedsController,
  PlacementController,
  PremisesController,
  TransfersController,
  UpdateOutOfServiceBedsController,
  PlacementAppealController,
  LocalRestrictionsController,
} from '../controllers/manage'
import manageRoutes from './manage'
import { type Controllers } from '../controllers'
import { type Services } from '../services'
import actions from './utils'
import paths from '../paths/manage'
import CancellationsController from '../controllers/manage/cancellationsController'
import RedirectController from '../controllers/redirectController'
import PlannedTransfersController from '../controllers/manage/premises/changeRequests/plannedTransferController'

jest.mock('./utils')

describe('manage routes', () => {
  const router = Router()
  const premisesController: DeepMocked<PremisesController> = createMock<PremisesController>({})
  const arrivalsController: DeepMocked<ArrivalsController> = createMock<ArrivalsController>({})
  const nonArrivalsController: DeepMocked<NonArrivalsController> = createMock<NonArrivalsController>({})
  const departuresController: DeepMocked<DeparturesController> = createMock<DeparturesController>({})
  const placementController: DeepMocked<PlacementController> = createMock<PlacementController>({})
  const bedsController: DeepMocked<BedsController> = createMock<BedsController>({})
  const outOfServiceBedsController: DeepMocked<OutOfServiceBedsController> = createMock<OutOfServiceBedsController>({})
  const updateOutOfServiceBedsController: DeepMocked<UpdateOutOfServiceBedsController> =
    createMock<UpdateOutOfServiceBedsController>({})
  const outOfServiceBedCancellationController: DeepMocked<OutOfServiceBedCancellationController> =
    createMock<OutOfServiceBedCancellationController>({})

  const localRestrictionsController: DeepMocked<LocalRestrictionsController> = createMock<LocalRestrictionsController>(
    {},
  )
  const cancellationsController: DeepMocked<CancellationsController> = createMock<CancellationsController>({})
  const redirectController: DeepMocked<RedirectController> = createMock<RedirectController>({})
  const keyworkerController: DeepMocked<KeyworkerController> = createMock<KeyworkerController>({})
  const apOccupancyViewController: DeepMocked<ApOccupancyViewController> = createMock<ApOccupancyViewController>({})
  const changesController: DeepMocked<ChangesController> = createMock<ChangesController>({})
  const transfersController: DeepMocked<TransfersController> = createMock<TransfersController>({})
  const placementAppealController: DeepMocked<PlacementAppealController> = createMock<PlacementAppealController>({})
  const plannedTransferController: DeepMocked<PlannedTransfersController> = createMock<PlannedTransfersController>()

  const controllers: DeepMocked<Controllers> = createMock<Controllers>({
    bedsController,
    outOfServiceBedsController,
    outOfServiceBedCancellationController,
    updateOutOfServiceBedsController,
    premisesController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    localRestrictionsController,
    cancellationsController,
    redirectController,
    placementController,
    keyworkerController,
    apOccupancyViewController,
    changesController,
    transfersController,
    placementAppealController,
    plannedTransferController,
  })
  const services: DeepMocked<Services> = createMock<Services>({})

  const getSpy = jest.fn()
  const postSpy = jest.fn()
  ;(actions as jest.Mock).mockReturnValue({ get: getSpy, post: postSpy, put: jest.fn(), delete: jest.fn() })

  it('should allow a user with permission cas1_premises_view to view a bed', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.premises.beds.show.pattern, bedsController.show(), {
      auditEvent: 'SHOW_BED',
      allowedPermissions: ['cas1_premises_view'],
    })
  })

  it('should allow a user with permission cas1 out of service bed create to access the new out of service bed view', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.outOfServiceBeds.new.pattern, outOfServiceBedsController.new(), {
      auditEvent: 'NEW_OUT_OF_SERVICE_BED',
      allowedPermissions: ['cas1_out_of_service_bed_create'],
    })
  })

  it('should allow a user with permission cas1 out of service bed create to create an out of service bed', () => {
    manageRoutes(controllers, router, services)

    expect(postSpy).toHaveBeenCalledWith(paths.outOfServiceBeds.new.pattern, outOfServiceBedsController.create(), {
      auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
      redirectAuditEventSpecs: [
        {
          path: paths.outOfServiceBeds.new.pattern,
          auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
        },
      ],
      allowedPermissions: ['cas1_out_of_service_bed_create'],
    })
  })

  it('should allow a user with permission cas1 view out of service beds to view out of service beds for a premises', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.outOfServiceBeds.premisesIndex.pattern,
      outOfServiceBedsController.premisesIndex(),
      {
        auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
        allowedPermissions: ['cas1_view_out_of_service_beds'],
      },
    )
  })

  it('should allow a user with permission cas1 out of service beds create to access the update out of service bed view', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.outOfServiceBeds.update.pattern, updateOutOfServiceBedsController.new(), {
      auditEvent: 'SHOW_UPDATE_OUT_OF_SERVICE_BED',
      allowedPermissions: ['cas1_out_of_service_bed_create'],
    })
  })

  it('should allow a user with with permission cas1 out of service bed create to update an out of service bed', () => {
    manageRoutes(controllers, router, services)

    expect(postSpy).toHaveBeenCalledWith(
      paths.outOfServiceBeds.update.pattern,
      updateOutOfServiceBedsController.create(),
      {
        auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED',
        allowedPermissions: ['cas1_out_of_service_bed_create'],
        redirectAuditEventSpecs: [
          {
            path: paths.outOfServiceBeds.show.pattern,
            auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED_FAILURE',
          },
        ],
      },
    )
  })

  it('should allow a user with permission cas1 out of service beds create to access the cancel out of service bed confirmation view', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.outOfServiceBeds.cancel.pattern,
      outOfServiceBedCancellationController.new(),
      {
        auditEvent: 'SHOW_CANCEL_OUT_OF_SERVICE_BED',
        allowedPermissions: ['cas1_out_of_service_bed_cancel'],
      },
    )
  })

  it('should allow a user with permission cas1_out_of_service_bed_cancel to cancel an out of service bed', () => {
    manageRoutes(controllers, router, services)

    expect(postSpy).toHaveBeenCalledWith(
      paths.outOfServiceBeds.cancel.pattern,
      outOfServiceBedCancellationController.cancel(),
      {
        auditEvent: 'CANCEL_OUT_OF_SERVICE_BED',
        allowedPermissions: ['cas1_out_of_service_bed_cancel'],
      },
    )
  })

  it('should allow a user with permission cas1 view out of service beds to view an out of service bed', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.outOfServiceBeds.show.pattern, outOfServiceBedsController.show(), {
      auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
      allowedPermissions: ['cas1_view_out_of_service_beds'],
    })
  })

  it('should allow users with permission cas1 view out of service beds to view all out of service beds', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.outOfServiceBeds.index.pattern, outOfServiceBedsController.index(), {
      auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
      allowedPermissions: ['cas1_view_out_of_service_beds'],
    })
  })

  it('should allow users with permission cas1 space booking record departure to record a departure', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.premises.placements.departure.new.pattern, departuresController.new(), {
      auditEvent: 'NEW_DEPARTURE',
      allowedPermissions: ['cas1_space_booking_record_departure'],
    })
  })

  it('should allow users with permission cas1_placement_appeal_create to create a placement appeal', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.premises.placements.appeal.new.pattern, placementAppealController.new(), {
      auditEvent: 'PLACEMENT_APPEAL_NEW',
      allowedPermissions: ['cas1_placement_appeal_create'],
    })
    expect(postSpy).toHaveBeenCalledWith(
      paths.premises.placements.appeal.new.pattern,
      placementAppealController.newSave(),
      {
        auditEvent: 'PLACEMENT_APPEAL_SAVE',
        allowedPermissions: ['cas1_placement_appeal_create'],
      },
    )
    expect(getSpy).toHaveBeenCalledWith(
      paths.premises.placements.appeal.confirm.pattern,
      placementAppealController.confirm(),
      {
        auditEvent: 'PLACEMENT_APPEAL_CONFIRM',
        allowedPermissions: ['cas1_placement_appeal_create'],
      },
    )
    expect(postSpy).toHaveBeenCalledWith(
      paths.premises.placements.appeal.confirm.pattern,
      placementAppealController.create(),
      {
        auditEvent: 'PLACEMENT_APPEAL_CREATE',
        allowedPermissions: ['cas1_placement_appeal_create'],
      },
    )
  })

  it('should allow users with permission cas1_transfer_create to create a planned transfer change request', () => {
    manageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.premises.placements.transfers.plannedDetails.pattern,
      plannedTransferController.details(),
      {
        auditEvent: 'TRANSFER_REQUEST_PLANNED_DETAILS',
        allowedPermissions: ['cas1_transfer_create'],
      },
    )
    expect(postSpy).toHaveBeenCalledWith(
      paths.premises.placements.transfers.plannedDetails.pattern,
      plannedTransferController.detailsSave(),
      {
        auditEvent: 'TRANSFER_REQUEST_PLANNED_DETAILS_SAVE',
        allowedPermissions: ['cas1_transfer_create'],
      },
    )
    expect(getSpy).toHaveBeenCalledWith(
      paths.premises.placements.transfers.plannedConfirm.pattern,
      plannedTransferController.confirm(),
      {
        auditEvent: 'TRANSFER_REQUEST_PLANNED_CONFIRM',
        allowedPermissions: ['cas1_transfer_create'],
      },
    )
    expect(postSpy).toHaveBeenCalledWith(
      paths.premises.placements.transfers.plannedConfirm.pattern,
      plannedTransferController.create(),
      {
        auditEvent: 'TRANSFER_REQUEST_PLANNED_CREATE',
        allowedPermissions: ['cas1_transfer_create'],
      },
    )
  })
})
