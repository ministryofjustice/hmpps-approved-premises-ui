/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/match'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const {
    placementRequestController,
    spaceSearchController,
    placementRequestBookingsController,
    spaceBookingsController,
  } = controllers

  get(paths.placementRequests.show.pattern, placementRequestController.show(), { auditEvent: 'SHOW_PLACEMENT_REQUEST' })

  get(paths.placementRequests.bookingNotMade.confirm.pattern, placementRequestBookingsController.bookingNotMade(), {
    auditEvent: 'NEW_BOOKING_NOT_MADE',
  })
  post(
    paths.placementRequests.bookingNotMade.create.pattern,
    placementRequestBookingsController.createBookingNotMade(),
    { auditEvent: 'CREATE_BOOKING_NOT_MADE' },
  )

  get(paths.v2Match.placementRequests.search.spaces.pattern, spaceSearchController.search(), {
    auditEvent: 'SPACE_SEARCH',
  })
  post(paths.v2Match.placementRequests.search.spaces.pattern, spaceSearchController.search(), {
    auditEvent: 'SPACE_SEARCH',
  })

  get(paths.placementRequests.bookings.confirm.pattern, placementRequestBookingsController.confirm())
  post(paths.placementRequests.bookings.create.pattern, placementRequestBookingsController.create(), {
    auditEvent: 'CREATE_BOOKING_FROM_PLACEMENT_REQUEST',
  })

  get(paths.v2Match.placementRequests.spaceBookings.new.pattern, spaceBookingsController.new(), {
    auditEvent: 'NEW_SPACE_BOOKING',
  })

  post(paths.v2Match.placementRequests.spaceBookings.create.pattern, spaceBookingsController.create(), {
    auditEvent: 'CREATE_SPACE_BOOKING',
  })

  return router
}
