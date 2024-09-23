import { Router } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { BookingExtensionsController, BookingsController } from '../controllers/manage'
import v2ManageRoutes from './v2Manage'
import { type Controllers } from '../controllers'
import { type Services } from '../services'
import {
  V2BedsController,
  V2OutOfServiceBedsController,
  V2PremisesController,
  V2UpdateOutOfServiceBedsController,
} from '../controllers/v2Manage'
import DateChangeController from '../controllers/manage/dateChangesController'
import actions from './utils'
import paths from '../paths/manage'

jest.mock('./utils')

describe('v2Manage routes', () => {
  const router = Router()
  const bookingExtensionsController: DeepMocked<BookingExtensionsController> = createMock<BookingExtensionsController>(
    {},
  )
  const bookingsController: DeepMocked<BookingsController> = createMock<BookingsController>({})
  const v2PremisesController: DeepMocked<V2PremisesController> = createMock<V2PremisesController>({})
  const v2BedsController: DeepMocked<V2BedsController> = createMock<V2BedsController>({})
  const v2OutOfServiceBedsController: DeepMocked<V2OutOfServiceBedsController> =
    createMock<V2OutOfServiceBedsController>({})
  const v2UpdateOutOfServiceBedsController: DeepMocked<V2UpdateOutOfServiceBedsController> =
    createMock<V2UpdateOutOfServiceBedsController>({})
  const dateChangesController: DeepMocked<DateChangeController> = createMock<DateChangeController>({})

  const controllers: DeepMocked<Controllers> = createMock<Controllers>({
    bookingExtensionsController,
    bookingsController,
    v2BedsController,
    v2OutOfServiceBedsController,
    v2UpdateOutOfServiceBedsController,
    dateChangesController,
    v2PremisesController,
  })
  const services: DeepMocked<Services> = createMock<Services>({})

  const getSpy = jest.fn()
  const postSpy = jest.fn()
  ;(actions as jest.Mock).mockReturnValue({ get: getSpy, post: postSpy, put: jest.fn(), delete: jest.fn() })

  it('should allow a user with role cru_member to view a bed', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(paths.v2Manage.premises.beds.show.pattern, v2BedsController.show(), {
      auditEvent: 'SHOW_BED',
      allowedRoles: ['future_manager', 'cru_member'],
      allowedPermissions: ['cas1_out_of_service_bed_create'],
    })
  })

  it('should allow a user with permission cas1 out of service bed create to access the new out of service bed view', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.new.pattern,
      v2OutOfServiceBedsController.new(),
      {
        auditEvent: 'NEW_OUT_OF_SERVICE_BED',
        allowedRoles: [],
        allowedPermissions: ['cas1_out_of_service_bed_create'],
      },
    )
  })

  it('should allow a user with permission cas1 out of service bed create to create an out of service bed', () => {
    v2ManageRoutes(controllers, router, services)

    expect(postSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.create.pattern,
      v2OutOfServiceBedsController.create(),
      {
        auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
        redirectAuditEventSpecs: [
          {
            path: paths.v2Manage.outOfServiceBeds.new.pattern,
            auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
          },
        ],
        allowedRoles: [],
        allowedPermissions: ['cas1_out_of_service_bed_create', 'cas1_view_out_of_service_beds'],
      },
    )
  })

  it('should allow a user with permission cas1 view out of service beds to view out of service beds for a premises', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.premisesIndex.pattern,
      v2OutOfServiceBedsController.premisesIndex(),
      {
        auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
        allowedRoles: [],
        allowedPermissions: ['cas1_view_out_of_service_beds'],
      },
    )
  })

  it('should allow a user with permission cas1 view out of service beds to to access the update out of service bed view', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.update.pattern,
      v2UpdateOutOfServiceBedsController.new(),
      {
        auditEvent: 'SHOW_UPDATE_OUT_OF_SERVICE_BED',
        allowedRoles: [],
        allowedPermissions: ['cas1_view_out_of_service_beds'],
      },
    )
  })

  it('should allow a user with with permission cas1 out of service bed create to update an out of service bed', () => {
    v2ManageRoutes(controllers, router, services)

    expect(postSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.update.pattern,
      v2UpdateOutOfServiceBedsController.create(),
      {
        auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED',
        allowedRoles: [],
        allowedPermissions: ['cas1_out_of_service_bed_create'],
        redirectAuditEventSpecs: [
          {
            path: paths.lostBeds.show.pattern,
            auditEvent: 'CREATE_UPDATE_LOST_BED_FAILURE',
          },
        ],
      },
    )
  })

  it('should allow a user with permission cas1 view out of service beds to view an out of service bed', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.show.pattern,
      v2OutOfServiceBedsController.show(),
      {
        auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
        allowedRoles: [],
        allowedPermissions: ['cas1_view_out_of_service_beds'],
      },
    )
  })

  it('should allow users with permission cas1 view out of service beds to view all out of service beds', () => {
    v2ManageRoutes(controllers, router, services)

    expect(getSpy).toHaveBeenCalledWith(
      paths.v2Manage.outOfServiceBeds.index.pattern,
      v2OutOfServiceBedsController.index(),
      {
        auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
        allowedRoles: [],
        allowedPermissions: ['cas1_view_out_of_service_beds'],
      },
    )
  })
})
