/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/manage'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)

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
    roomsController,
    bedsController,
  } = controllers

  get(paths.premises.index.pattern, premisesController.index())
  get(paths.premises.show.pattern, premisesController.show())

  get(paths.premises.rooms.pattern, roomsController.index())
  get(paths.premises.room.pattern, roomsController.show())

  get(paths.premises.beds.index.pattern, bedsController.index())

  get(paths.bookings.new.pattern, bookingsController.new())
  get(paths.bookings.show.pattern, bookingsController.show())
  post(paths.bookings.create.pattern, bookingsController.create())
  get(paths.bookings.confirm.pattern, bookingsController.confirm())

  post(paths.people.find.pattern, peopleController.find())

  get(paths.bookings.extensions.new.pattern, bookingExtensionsController.new())
  post(paths.bookings.extensions.create.pattern, bookingExtensionsController.create())
  get(paths.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new())
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create())

  get(paths.bookings.nonArrivals.new.pattern, nonArrivalsController.new())
  post(paths.bookings.nonArrivals.create.pattern, nonArrivalsController.create())

  get(paths.bookings.cancellations.new.pattern, cancellationsController.new())
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create())

  get(paths.bookings.departures.new.pattern, departuresController.new())
  post(paths.bookings.departures.create.pattern, departuresController.create())

  get(paths.lostBeds.new.pattern, lostBedsController.new())
  post(paths.lostBeds.create.pattern, lostBedsController.create())
  get(paths.lostBeds.show.pattern, lostBedsController.show())

  return router
}
