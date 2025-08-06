import { Response } from 'superagent'
import { ApArea, Cas1ChangeRequestType, Cas1CruManagementArea, NamedId, NonArrivalReason } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import { stubFor } from './setup'
import {
  apAreaFactory,
  cruManagementAreaFactory,
  departureReasonFactory,
  nonArrivalReasonsFactory,
  referenceDataFactory,
} from '../../server/testutils/factories'
import paths from '../../server/paths/api'

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
      url: paths.referenceData({ type: 'ap-areas' }),
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
      url: paths.cas1ReferenceData({ type: 'cru-management-areas' }),
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
      url: paths.cas1ReferenceData({ type: 'non-arrival-reasons' }),
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
      url: paths.cas1ReferenceData({ type: 'departure-reasons' }),
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
      url: paths.cas1ReferenceData({ type: 'move-on-categories' }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: moveOnCategories || referenceDataFactory.buildList(5),
    },
  })

const stubChangeRequestReasonsReferenceData = ({
  changeRequestType,
  reasons,
}: {
  changeRequestType: Cas1ChangeRequestType
  reasons: Array<NamedId>
}) =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.cas1ReferenceData({ type: `change-request-reasons/${changeRequestType}` }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: reasons,
    },
  })

const stubChangeRequestRejectionReasonsReferenceData = ({
  changeRequestType,
  reasons,
}: {
  changeRequestType: Cas1ChangeRequestType
  reasons: Array<NamedId>
}) =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.cas1ReferenceData({ type: `change-request-rejection-reasons/${changeRequestType}` }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: reasons,
    },
  })

export default {
  stubApAreaReferenceData,
  stubCruManagementAreaReferenceData,
  stubNonArrivalReasonsReferenceData,
  stubDepartureReasonsReferenceData,
  stubMoveOnCategoriesReferenceData,
  stubChangeRequestReasonsReferenceData,
  stubChangeRequestRejectionReasonsReferenceData,
}
