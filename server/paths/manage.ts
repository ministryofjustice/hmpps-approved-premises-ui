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
}

// Manage V2 paths
const v2ManagePath = path('/manage')
const v2PremisesPath = v2ManagePath.path('/premises')
const v2SinglePremisesPath = v2PremisesPath.path(':premisesId')
const v2BookingsPath = v2SinglePremisesPath.path('bookings')
const v2BookingPath = v2BookingsPath.path(':bookingId')
const v2BedsPath = v2SinglePremisesPath.path('beds')
const v2DateChangesPath = v2BookingPath.path('date-changes')
const v2ExtensionsPath = v2BookingPath.path('extensions')
const outOfServiceBedsPath = v2SinglePremisesPath.path('beds/:bedId/out-of-service-beds')
const outOfServiceBedPath = outOfServiceBedsPath.path(':id')
const outOfServiceBedsIndexPath = v2ManagePath.path('/out-of-service-beds')

const v2Manage = {
  premises: {
    index: v2PremisesPath,
    show: v2SinglePremisesPath,
    capacity: v2SinglePremisesPath.path('capacity'),
    beds: {
      index: v2BedsPath,
      show: v2BedsPath.path(':bedId'),
      overbookings: {
        show: v2BedsPath.path(':bedId').path('overbookings'),
      },
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
