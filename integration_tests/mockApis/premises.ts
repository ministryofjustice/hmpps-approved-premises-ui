import type {
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1PremisesDaySummary,
  ExtendedPremisesSummary,
  ApprovedPremisesSummary as PremisesSummary,
  StaffMember,
} from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
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

const stubPremiseCapacity = (args: {
  premisesId: string
  startDate: string
  endDate: string
  premiseCapacity: Cas1PremiseCapacity
}) =>
  stubFor({
    request: {
      method: 'GET',
      url: `${paths.premises.capacity({ premisesId: args.premisesId })}?${createQueryString({
        startDate: args.startDate,
        endDate: args.endDate,
      })}`,
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
  stubAllPremises,
  stubCas1AllPremises,
  stubPremisesSummary,
  stubSinglePremises,
  stubPremisesStaffMembers,
  stubPremiseCapacity,
  stubPremisesDaySummary,
  verifyPremisesDaySummaryRequest,
}
