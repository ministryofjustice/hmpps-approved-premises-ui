import type { Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import { errorStub } from './utils'
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
  stubDateChange: (args: { premisesId: string; bookingId: string }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.bookings.dateChange({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubDateChangeErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(
      errorStub(
        args.params,
        paths.premises.bookings.dateChange({ premisesId: args.premisesId, bookingId: args.bookingId }),
      ),
    ),
  verifyDateChange: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.bookings.dateChange({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}
