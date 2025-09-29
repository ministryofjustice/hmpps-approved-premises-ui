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
    occupancyViewController,
    newPlacementController,
  } = controllers

  get(paths.placementRequests.show.pattern, placementRequestController.show(), { auditEvent: 'SHOW_PLACEMENT_REQUEST' })

  get(paths.placementRequests.bookingNotMade.confirm.pattern, placementRequestBookingsController.bookingNotMade(), {
    auditEvent: 'NEW_BOOKING_NOT_MADE',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(
    paths.placementRequests.bookingNotMade.create.pattern,
    placementRequestBookingsController.createBookingNotMade(),
    {
      auditEvent: 'CREATE_BOOKING_NOT_MADE',
      allowedPermissions: ['cas1_space_booking_create'],
    },
  )

  get(paths.v2Match.placementRequests.newPlacement.new.pattern, newPlacementController.new(), {
    auditEvent: 'NEW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.v2Match.placementRequests.newPlacement.new.pattern, newPlacementController.saveNew(), {
    auditEvent: 'NEW_PLACEMENT_SAVE',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  get(paths.v2Match.placementRequests.newPlacement.criteria.pattern, newPlacementController.criteria(), {
    auditEvent: 'NEW_PLACEMENT_CRITERIA',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  get(paths.v2Match.placementRequests.search.spaces.pattern, spaceSearchController.search(), {
    auditEvent: 'SPACE_SEARCH',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.v2Match.placementRequests.search.spaces.pattern, spaceSearchController.filterSearch(), {
    auditEvent: 'SPACE_SEARCH_FILTER',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  get(paths.v2Match.placementRequests.search.occupancy.pattern, occupancyViewController.view(), {
    auditEvent: 'OCCUPANCY_VIEW',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.v2Match.placementRequests.search.occupancy.pattern, occupancyViewController.filterView(), {
    auditEvent: 'OCCUPANCY_VIEW_FILTER',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.v2Match.placementRequests.search.occupancyBook.pattern, occupancyViewController.bookSpace(), {
    auditEvent: 'OCCUPANCY_VIEW_BOOK_SPACE',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  get(paths.v2Match.placementRequests.search.dayOccupancy.pattern, occupancyViewController.viewDay(), {
    auditEvent: 'OCCUPANCY_VIEW_DAY',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  get(paths.v2Match.placementRequests.spaceBookings.new.pattern, spaceBookingsController.new(), {
    auditEvent: 'NEW_SPACE_BOOKING',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.v2Match.placementRequests.spaceBookings.create.pattern, spaceBookingsController.create(), {
    auditEvent: 'CREATE_SPACE_BOOKING',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  return router
}
