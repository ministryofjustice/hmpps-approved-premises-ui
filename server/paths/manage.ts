import { path } from 'static-path'

// V1 Manage paths
const v1PremisesPath = path('/premises')
const v1SinglePremisesPath = v1PremisesPath.path(':premisesId')

const v1BookingsPath = v1SinglePremisesPath.path('bookings')
const v1BookingPath = v1BookingsPath.path(':bookingId')

const v1PeoplePath = v1BookingsPath.path('people')

const v1ExtensionsPath = v1BookingPath.path('extensions')

const v1CancellationsPath = v1BookingPath.path('cancellations')

const v1LostBedsPath = v1SinglePremisesPath.path('beds/:bedId/lost-beds')

const v1BedsPath = v1SinglePremisesPath.path('beds')

const v1DateChangesPath = v1BookingPath.path('date-changes')

const deprecated = {
  premises: {
    index: v1PremisesPath,
    show: v1SinglePremisesPath,
    beds: {
      index: v1BedsPath,
      show: v1BedsPath.path(':bedId'),
    },
  },
  bookings: {
    show: v1BookingPath,
    dateChanges: {
      new: v1DateChangesPath.path('new'),
      create: v1DateChangesPath,
    },
    extensions: {
      new: v1ExtensionsPath.path('new'),
      create: v1ExtensionsPath,
      confirm: v1ExtensionsPath.path('confirmation'),
    },
  },
  lostBeds: {
    new: v1LostBedsPath.path('new'),
    create: v1LostBedsPath,
    index: v1SinglePremisesPath.path('lost-beds'),
    show: v1LostBedsPath.path(':id'),
    update: v1SinglePremisesPath.path('lost-beds').path(':id'),
  },
}

// Manage paths
const managePath = path('/manage')
const premisesPath = managePath.path('premises')
const singlePremisesPath = premisesPath.path(':premisesId')
const bookingsPath = singlePremisesPath.path('bookings')
const bookingPath = bookingsPath.path(':bookingId')
const bedsPath = singlePremisesPath.path('beds')
const dateChangesPath = bookingPath.path('date-changes')
const extensionsPath = bookingPath.path('extensions')
const outOfServiceBedsPath = singlePremisesPath.path('beds/:bedId/out-of-service-beds')
const outOfServiceBedPath = outOfServiceBedsPath.path(':id')
const outOfServiceBedsIndexPath = managePath.path('out-of-service-beds')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
    beds: {
      index: bedsPath,
      show: bedsPath.path(':bedId'),
    },
    placements: {
      index: singlePremisesPath.path('space-bookings'),
      show: singlePremisesPath.path('space-bookings').path(':bookingId'),
    },
    placements: {
      index: singlePremisesPath.path('space-bookings'),
      show: singlePremisesPath.path('space-bookings').path(':bookingId'),
    },
  },

  bookings: {
    show: bookingsPath.path(':bookingId'),
    dateChanges: {
      new: dateChangesPath.path('new'),
      create: dateChangesPath,
    },
    extensions: {
      new: extensionsPath.path('new'),
      create: extensionsPath,
      confirm: extensionsPath.path('confirmation'),
    },
    cancellations: {
      new: v1CancellationsPath.path('new'), // no v2 equivalent
      create: v1CancellationsPath, // no v2 equivalent
    },
  },
  people: {
    find: v1PeoplePath, // no v2 equivalent
  },
  outOfServiceBeds: {
    new: outOfServiceBedsPath.path('new'),
    create: outOfServiceBedsPath,
    premisesIndex: singlePremisesPath.path('out-of-service-beds').path(':temporality'),
    index: outOfServiceBedsIndexPath.path(':temporality'),
    show: outOfServiceBedPath.path(':tab'),
    update: outOfServiceBedPath.path('update'),
  },
}

export default { deprecated, ...paths }
