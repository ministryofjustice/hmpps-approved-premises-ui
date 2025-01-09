import type {
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  ExtendedPremisesSummary,
  ApprovedPremisesSummary as PremisesSummary,
  StaffMember,
} from '@approved-premises/api'

import { stubFor } from './setup'
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
      url: `${paths.premises.capacity({ premisesId: args.premiseCapacity.premise.id })}?${createQueryString({
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

export default {
  stubAllPremises,
  stubCas1AllPremises,
  stubPremisesSummary,
  stubSinglePremises,
  stubPremisesStaffMembers,
  stubPremiseCapacity,
}
