import type { Booking } from '@approved-premises/api'

import { stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubBookingGet: (args: { premisesId: string; booking: Booking }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/bookings/${args.booking.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  stubBookingFindWithoutPremises: (booking: Booking) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.bookings.bookingWithoutPremisesPath({ bookingId: booking.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: booking,
      },
    }),
}
