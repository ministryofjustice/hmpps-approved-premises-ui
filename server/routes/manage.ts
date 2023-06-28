/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'
import paths from '../paths/manage'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const {
    premisesController,
    bookingsController,
    bookingExtensionsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    lostBedsController,
    peopleController,
    bedsController,
    moveBedsController,
  } = controllers

  get(paths.premises.index.pattern, premisesController.index(), { auditEvent: 'LIST_PREMISES' })
  get(paths.premises.show.pattern, premisesController.show(), { auditEvent: 'SHOW_PREMISES' })
  get(paths.premises.calendar.pattern, premisesController.calendar(), { auditEvent: 'SHOW_PREMISES_CALENDAR' })

  get(paths.premises.beds.index.pattern, bedsController.index(), { auditEvent: 'LIST_BEDS' })
  get(paths.premises.beds.show.pattern, bedsController.show(), { auditEvent: 'SHOW_BED' })

  get(paths.bookings.new.pattern, bookingsController.new(), { auditEvent: 'START_AD_HOC_BOOKING' })
  get(paths.bookings.show.pattern, bookingsController.show(), { auditEvent: 'SHOW_BOOKING' })
  post(paths.bookings.create.pattern, bookingsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_FAILURE',
      },
      {
        path: paths.bookings.confirm.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_SUCCESS',
      },
    ],
  })
  get(paths.bookings.confirm.pattern, bookingsController.confirm())

  post(paths.people.find.pattern, peopleController.find(), { auditEvent: 'FIND_PERSON', auditBodyParams: ['crn'] })

  get(paths.bookings.extensions.new.pattern, bookingExtensionsController.new(), { auditEvent: 'NEW_BOOKING_EXTENSION' })
  post(paths.bookings.extensions.create.pattern, bookingExtensionsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.extensions.create.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_FAILURE',
      },
      {
        path: paths.bookings.extensions.confirm.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_SUCCESS',
      },
    ],
  })
  get(paths.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new(), { auditEvent: 'NEW_ARRIVAL' })
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create(), {
    auditEvent: 'CREATE_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.arrivals.new.pattern,
        auditEvent: 'CREATE_ARRIVAL_FAILURE',
      },
    ],
  })

  get(paths.bookings.nonArrivals.new.pattern, nonArrivalsController.new(), { auditEvent: 'NEW_NON_ARRIVAL' })
  post(paths.bookings.nonArrivals.create.pattern, nonArrivalsController.create(), {
    auditEvent: 'CREATE_NON_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.nonArrivals.new.pattern,
        auditEvent: 'CREATE_NON_ARRIVAL_FAILURE',
      },
    ],
  })

  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), { auditEvent: 'NEW_CANCELLATION' })
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
  })

  get(paths.bookings.departures.new.pattern, departuresController.new(), { auditEvent: 'NEW_DEPARTURE' })
  post(paths.bookings.departures.create.pattern, departuresController.create(), {
    auditEvent: 'CREATE_DEPARTURE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.departures.new.pattern,
        auditEvent: 'CREATE_DEPARTURE_FAILURE',
      },
    ],
  })

  get(paths.lostBeds.new.pattern, lostBedsController.new(), { auditEvent: 'NEW_LOST_BED' })
  post(paths.lostBeds.create.pattern, lostBedsController.create(), {
    auditEvent: 'CREATE_LOST_BED_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.lostBeds.new.pattern,
        auditEvent: 'CREATE_LOST_BED_FAILURE',
      },
    ],
  })
  get(paths.lostBeds.index.pattern, lostBedsController.index(), { auditEvent: 'LIST_LOST_BEDS' })
  get(paths.lostBeds.show.pattern, lostBedsController.show(), { auditEvent: 'SHOW_LOST_BED' })
  post(paths.lostBeds.update.pattern, lostBedsController.update(), {
    auditEvent: 'UPDATE_LOST_BED_SUCCESS',
    auditBodyParams: ['cancel'],
    redirectAuditEventSpecs: [
      {
        path: paths.lostBeds.show.pattern,
        auditEvent: 'UPDATE_LOST_BED_FAILURE',
      },
    ],
  })

  get(paths.bookings.moves.new.pattern, moveBedsController.new(), { auditEvent: 'NEW_BED_MOVE' })
  post(paths.bookings.moves.create.pattern, moveBedsController.create(), {
    auditEvent: 'BED_MOVE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.moves.new.pattern,
        auditEvent: 'BED_MOVE_FAILURE',
      },
    ],
  })

  return router
}
