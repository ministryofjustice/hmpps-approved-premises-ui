import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const bookingsPath = singlePremisesPath.path('bookings')
const bookingPath = bookingsPath.path(':bookingId')
const newBookingPath = singlePremisesPath.path('beds/:bedId/bookings/new')

const peoplePath = bookingsPath.path('people')

const extensionsPath = bookingPath.path('extensions')

const arrivalsPath = bookingPath.path('arrivals')

const nonArrivalsPath = bookingPath.path('non-arrivals')

const cancellationsPath = bookingPath.path('cancellations')

const departuresPath = bookingPath.path('departures')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const roomsPath = singlePremisesPath.path('rooms')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
    capacity: singlePremisesPath.path('capacity'),
    rooms: roomsPath,
    room: roomsPath.path(':roomId'),
  },
  bookings: {
    new: newBookingPath,
    show: bookingPath,
    create: newBookingPath,
    confirm: bookingPath.path('confirmation'),
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
  },
  people: {
    find: peoplePath,
  },
  lostBeds: {
    new: lostBedsPath.path('new'),
    create: lostBedsPath,
  },
}

export default paths
