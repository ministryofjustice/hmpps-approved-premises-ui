import { SuperAgentRequest } from 'superagent'

import type { PlacementApplication } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubPlacementApplication: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placementApplications.show({ id: placementApplication.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementApplication,
      },
    }),
  stubPlacementApplicationUpdate: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.placementApplications.update({
          id: placementApplication.id,
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: placementApplication,
      },
    }),
  stubCreatePlacementApplication: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementApplications.create.pattern,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementApplication,
      },
    }),
  stubSubmitPlacementApplication: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementApplications.submit({ id: placementApplication.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementApplication,
      },
    }),
  stubSubmitPlacementApplicationDecision: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementApplications.submitDecision({ id: placementApplication.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementApplication,
      },
    }),
  stubSubmitPlacementApplicationWithdraw: (placementApplication: PlacementApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementApplications.withdraw({ id: placementApplication.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementApplication,
      },
    }),
  verifyPlacementApplicationSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementApplications.submit({ id: applicationId }),
      })
    ).body.requests,

  verifyPlacementApplicationReviewSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementApplications.submitDecision({ id: applicationId }),
      })
    ).body.requests,
  verifyPlacementApplicationWithdrawn: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementApplications.withdraw({ id: applicationId }),
      })
    ).body.requests,
}
