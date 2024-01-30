import type { Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import paths from '../../server/paths/api'

export default {
  stubBookingCreate: (args: { premisesId: string; booking: Booking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  stubBookingCreateConflictError: (args: {
    premisesId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  stubBookingErrors: (args: { premisesId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings`)),
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
  stubBookingsForPremisesId: (args: { premisesId: string; bookings: Array<Booking> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(args.bookings),
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
  verifyBookingCreate: async (args: { premisesId }) =>
    (await getMatchingRequests({ method: 'POST', url: `/premises/${args.premisesId}/bookings` })).body.requests,
}
