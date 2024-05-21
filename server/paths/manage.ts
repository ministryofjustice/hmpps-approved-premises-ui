import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

// Manage V2 paths
const managePremisesPath = path('/manage/premises')
const manageSinglePremisesPath = managePremisesPath.path(':premisesId')

const bookingsPath = singlePremisesPath.path('bookings')
const bookingPath = bookingsPath.path(':bookingId')
const newBookingPath = singlePremisesPath.path('beds/bookings/new')

const peoplePath = bookingsPath.path('people')

const extensionsPath = bookingPath.path('extensions')

const arrivalsPath = bookingPath.path('arrivals')

const nonArrivalsPath = bookingPath.path('non-arrivals')

const cancellationsPath = bookingPath.path('cancellations')

const departuresPath = bookingPath.path('departures')

const movesPath = bookingPath.path('moves')

const lostBedsPath = singlePremisesPath.path('beds/:bedId/lost-beds')

const outOfServiceBedsPath = manageSinglePremisesPath.path('beds/:bedId/out-of-service-beds')

const bedsPath = singlePremisesPath.path('beds')

const dateChangesPath = bookingPath.path('date-changes')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
    capacity: singlePremisesPath.path('capacity'),
    calendar: singlePremisesPath.path('calendar'),
    beds: {
      index: bedsPath,
      show: bedsPath.path(':bedId'),
      overbookings: {
        show: bedsPath.path(':bedId').path('overbookings'),
      },
    },
  },
  bookings: {
    new: newBookingPath,
    show: bookingPath,
    create: newBookingPath,
    confirm: bookingPath.path('confirmation'),
    dateChanges: {
      new: dateChangesPath.path('new'),
      create: dateChangesPath,
    },
    extensions: {
      new: extensionsPath.path('new'),
      create: extensionsPath,
      confirm: extensionsPath.path('confirmation'),
    },
    arrivals: {
      new: arrivalsPath.path('new'),
      create: arrivalsPath,
    },
    nonArrivals: {
      new: nonArrivalsPath.path('new'),
      create: nonArrivalsPath,
    },
    cancellations: {
      new: cancellationsPath.path('new'),
      create: cancellationsPath,
    },
    departures: {
      new: departuresPath.path('new'),
      create: departuresPath,
    },
    moves: {
      new: movesPath.path('new'),
      create: movesPath,
    },
  },
  people: {
    find: peoplePath,
  },
  lostBeds: {
    new: lostBedsPath.path('new'),
    create: lostBedsPath,
    index: singlePremisesPath.path('lost-beds'),
    show: lostBedsPath.path(':id'),
    update: singlePremisesPath.path('lost-beds').path(':id'),
    cancel: singlePremisesPath.path('lost-beds').path(':id').path('cancellations'),
  },
  outOfServiceBeds: {
    new: outOfServiceBedsPath.path('new'),
    create: outOfServiceBedsPath,
    index: singlePremisesPath.path('out-of-service-beds'),
    show: outOfServiceBedsPath.path(':id'),
    update: singlePremisesPath.path('out-of-service-beds').path(':id'),
    cancel: singlePremisesPath.path('out-of-service-beds').path(':id').path('cancellations'),
  },
}

export default paths
