import type {
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1PremisesDaySummary,
  StaffMember,
} from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

const stubCas1AllPremises = (args: { premises: Array<Cas1PremisesBasicSummary>; cruManagementAreaId?: string }) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPath: paths.premises.index({}),
      queryParameters: {
        cruManagementAreaId: args.cruManagementAreaId ? { equalTo: args.cruManagementAreaId } : { absent: true },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.premises,
    },
  })
}

const stubSinglePremises = (premises: Cas1Premises) =>
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

const stubPremisesStaffMembers = (args: { premisesId: string; staffMembers: Array<StaffMember> }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: paths.premises.staffMembers.index({ premisesId: args.premisesId }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.staffMembers,
    },
  })

const stubPremisesCapacity = (args: {
  premisesId: string
  startDate: string
  endDate: string
  excludeSpaceBookingId?: string
  premiseCapacity: Cas1PremiseCapacity
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: paths.premises.capacity({ premisesId: args.premisesId }),
      queryParameters: {
        startDate: { equalTo: args.startDate },
        endDate: { equalTo: args.endDate },
        excludeSpaceBookingId: args.excludeSpaceBookingId ? { equalTo: args.excludeSpaceBookingId } : undefined,
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.premiseCapacity,
    },
  })

const stubPremisesDaySummary = (args: {
  premisesId: string
  date: string
  premisesDaySummary: Cas1PremisesDaySummary
}) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPath: paths.premises.daySummary({ premisesId: args.premisesId, date: args.date }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.premisesDaySummary,
    },
  })
}

const verifyPremisesDaySummaryRequest = async ({ premisesId, date }: { premisesId: string; date: string }) =>
  (
    await getMatchingRequests({
      method: 'GET',
      urlPath: paths.premises.daySummary({ premisesId, date }),
    })
  ).body.requests

export default {
  stubCas1AllPremises,
  stubSinglePremises,
  stubPremisesStaffMembers,
  stubPremisesCapacity,
  stubPremisesDaySummary,
  verifyPremisesDaySummaryRequest,
}
