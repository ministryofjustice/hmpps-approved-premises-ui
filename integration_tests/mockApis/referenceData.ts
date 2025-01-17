import { Response } from 'superagent'
import { ApArea, Cas1CruManagementArea, NonArrivalReason } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import { stubFor } from './setup'
import {
  apAreaFactory,
  cruManagementAreaFactory,
  departureReasonFactory,
  nonArrivalReasonsFactory,
  referenceDataFactory,
} from '../../server/testutils/factories'

export const stubApAreaReferenceData = (
  {
    apArea = null,
    additionalAreas = [],
  }: {
    apArea: ApArea | null
    additionalAreas: Array<ApArea>
  } = { apArea: null, additionalAreas: [] },
): Promise<Response> => {
  const apAreas = [...additionalAreas.map(area => apAreaFactory.build(area)), ...apAreaFactory.buildList(10)]

  if (apArea != null) {
    apAreas.push(apAreaFactory.build(apArea))
  }

  return stubFor({
    request: {
      method: 'GET',
      url: '/reference-data/ap-areas',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: apAreas,
    },
  })
}

export const stubCruManagementAreaReferenceData = (
  args: {
    cruManagementAreas?: Array<Cas1CruManagementArea>
  } = {},
) => {
  return stubFor({
    request: {
      method: 'GET',
      url: '/cas1/reference-data/cru-management-areas',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.cruManagementAreas || cruManagementAreaFactory.buildList(5),
    },
  })
}

export const stubNonArrivalReasonsReferenceData = (nonArrivalReasons: Array<NonArrivalReason>) => {
  return stubFor({
    request: {
      method: 'GET',
      url: '/cas1/reference-data/non-arrival-reasons',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: nonArrivalReasons || nonArrivalReasonsFactory.buildList(10),
    },
  })
}

const stubDepartureReasonsReferenceData = (departureReasons?: Array<ReferenceData>) =>
  stubFor({
    request: {
      method: 'GET',
      url: '/cas1/reference-data/departure-reasons',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: departureReasons || departureReasonFactory.buildList(5),
    },
  })
const stubMoveOnCategoriesReferenceData = (moveOnCategories?: Array<ReferenceData>) =>
  stubFor({
    request: {
      method: 'GET',
      url: '/cas1/reference-data/move-on-categories',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: moveOnCategories || referenceDataFactory.buildList(5),
    },
  })

export default {
  stubApAreaReferenceData,
  stubCruManagementAreaReferenceData,
  stubNonArrivalReasonsReferenceData,
  stubDepartureReasonsReferenceData,
  stubMoveOnCategoriesReferenceData,
}
