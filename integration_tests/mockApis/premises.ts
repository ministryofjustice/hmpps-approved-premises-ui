import type { Response, SuperAgentRequest } from 'superagent'

import type {
  BedOccupancyRange,
  Booking,
  Cas1PremisesBasicSummary,
  ExtendedPremisesSummary,
  Premises,
  ApprovedPremisesSummary as PremisesSummary,
  StaffMember,
} from '@approved-premises/api'

import { stubFor } from './setup'
import bookingStubs from './booking'
import paths from '../../server/paths/api'
import { createQueryString } from '../../server/utils/utils'

const stubAllPremises = (premises: Array<PremisesSummary>) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/premises/summary',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })

const stubCas1AllPremises = (premises: Array<Cas1PremisesBasicSummary>) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/cas1/premises/summary.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })
}

const stubPremisesSummary = (premises: ExtendedPremisesSummary) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: paths.premises.summary({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })

const stubSinglePremises = (premises: Premises) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: paths.premises.show({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })

export default {
  stubAllPremises,
  stubCas1AllPremises,
  stubPremisesSummary,
  stubSinglePremises,
  stubPremisesWithBookings: (args: { premises: Premises; bookings: Array<Booking> }): Promise<[Response, Response]> =>
    Promise.all([
      stubPremisesSummary(args.premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: args.premises.id, bookings: args.bookings }),
    ]),
  stubPremisesStaff: (args: { premisesId: string; staff: Array<StaffMember> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/staff`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.staff,
      },
    }),
  stubPremisesOccupancy: (args: {
    premisesId: string
    startDate: string
    endDate: string
    premisesOccupancy: Array<BedOccupancyRange>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.premises.calendar({ premisesId: args.premisesId })}?${createQueryString({
          startDate: args.startDate,
          endDate: args.endDate,
        })}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.premisesOccupancy,
      },
    }),
}
