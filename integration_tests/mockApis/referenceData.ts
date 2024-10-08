import { Response } from 'superagent'
import { ApArea } from '@approved-premises/api'
import { stubFor } from './setup'
import { apAreaFactory } from '../../server/testutils/factories'

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

export const stubCRUManagementAreaReferenceData = ({ cruManagementAreas }) => {
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
      jsonBody: cruManagementAreas,
    },
  })
}

export default {
  stubApAreaReferenceData,
  stubCRUManagementAreaReferenceData,
}
