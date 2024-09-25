import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

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

const bedsPath = singlePremisesPath.path('beds')

const dateChangesPath = bookingPath.path('date-changes')

const paths = {
  premises: {
    index: premisesPath, // redirected
    show: singlePremisesPath, // redirected
    capacity: singlePremisesPath.path('capacity'), // not implemented
    calendar: singlePremisesPath.path('calendar'), // not implemented, used in Calendar utils
    beds: {
      index: bedsPath, // redirected
      show: bedsPath.path(':bedId'), // redirected
      overbookings: {
        show: bedsPath.path(':bedId').path('overbookings'), // not implemented, used in Calendar utils
      },
    },
  },
  bookings: {
    new: newBookingPath, // no v2 equivalent
    show: bookingPath, // redirected to v2
    create: newBookingPath, // no v2 equivalent
    confirm: bookingPath.path('confirmation'), // no v2 equivalent
    dateChanges: {
      new: dateChangesPath.path('new'), // redirected to v2
      create: dateChangesPath, // redirected to v2
    },
    extensions: {
      new: extensionsPath.path('new'), // redirected to v2
      create: extensionsPath, // redirected to v2
      confirm: extensionsPath.path('confirmation'), // redirected to v2
    },
    arrivals: {
      new: arrivalsPath.path('new'), // no v2 equivalent
      create: arrivalsPath, // no v2 equivalent
    },
    nonArrivals: {
      new: nonArrivalsPath.path('new'), // no v2 equivalent
      create: nonArrivalsPath, // no v2 equivalent
    },
    cancellations: {
      new: cancellationsPath.path('new'), // no v2 equivalent
      create: cancellationsPath, // no v2 equivalent
    },
    departures: {
      new: departuresPath.path('new'), // no v2 equivalent
      create: departuresPath, // no v2 equivalent
    },
    moves: {
      new: movesPath.path('new'), // no v2 equivalent
      create: movesPath, // no v2 equivalent
    },
  },
  people: {
    find: peoplePath, // no v2 equivalent
  },
  lostBeds: {
    new: lostBedsPath.path('new'), // redirected to v2
    create: lostBedsPath, // redirected to v2
    index: singlePremisesPath.path('lost-beds'), // redirected to v2
    show: lostBedsPath.path(':id'), // redirected to v2
    update: singlePremisesPath.path('lost-beds').path(':id'), // redirected to v2
    cancel: singlePremisesPath.path('lost-beds').path(':id').path('cancellations'), // not implemented
  },
}

// Manage V2 paths
const v2ManagePath = path('/manage')
const v2PremisesPath = v2ManagePath.path('premises')
const v2SinglePremisesPath = v2PremisesPath.path(':premisesId')
const v2BookingsPath = v2SinglePremisesPath.path('bookings')
const v2BookingPath = v2BookingsPath.path(':bookingId')
const v2BedsPath = v2SinglePremisesPath.path('beds')
const v2DateChangesPath = v2BookingPath.path('date-changes')
const v2ExtensionsPath = v2BookingPath.path('extensions')
const outOfServiceBedsPath = v2SinglePremisesPath.path('beds/:bedId/out-of-service-beds')
const outOfServiceBedPath = outOfServiceBedsPath.path(':id')
const outOfServiceBedsIndexPath = v2ManagePath.path('out-of-service-beds')

const v2Manage = {
  premises: {
    index: v2PremisesPath,
    show: v2SinglePremisesPath,
    capacity: v2SinglePremisesPath.path('capacity'),
    beds: {
      index: v2BedsPath,
      show: v2BedsPath.path(':bedId'),
    },
  },
  bookings: {
    show: v2BookingsPath.path(':bookingId'),
    dateChanges: {
      new: v2DateChangesPath.path('new'),
      create: v2DateChangesPath,
    },
    extensions: {
      new: v2ExtensionsPath.path('new'),
      create: v2ExtensionsPath,
      confirm: v2ExtensionsPath.path('confirmation'),
    },
  },
  outOfServiceBeds: {
    new: outOfServiceBedsPath.path('new'),
    create: outOfServiceBedsPath,
    premisesIndex: v2SinglePremisesPath.path('out-of-service-beds').path(':temporality'),
    index: outOfServiceBedsIndexPath.path(':temporality'),
    show: outOfServiceBedPath.path(':tab'),
    update: outOfServiceBedPath.path('update'),
    cancel: singlePremisesPath.path('out-of-service-beds').path(':id').path('cancellations'),
  },
}

export default { ...paths, v2Manage }
