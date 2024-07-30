import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceSearchController from './spaceSearchController'
import {
  placementRequestDetailFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultsFactory,
} from '../../../testutils/factories'

import { PlacementRequestService, SpaceService } from '../../../services'
import { mapPlacementRequestToSpaceSearchParams } from '../../../utils/placementRequests/utils'
import matchPaths from '../../../paths/match'

describe('spaceSearchController', () => {
  const token = 'SOME_TOKEN'
  const placementRequestDetail = placementRequestDetailFactory.build()
  const spaceSearchResults = spaceSearchResultsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({
    params: { id: placementRequestDetail.id },
    user: { token },
    body: {},
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const spaceService = createMock<SpaceService>({})
  const placementRequestService = createMock<PlacementRequestService>({})

  let spaceSearchController: SpaceSearchController

  const formPath = matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequestDetail.id })

  beforeEach(() => {
    jest.resetAllMocks()
    spaceSearchController = new SpaceSearchController(spaceService, placementRequestService)

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    spaceService.search.mockResolvedValue(spaceSearchResults)
  })

  describe('search', () => {
    describe('body params are sent', () => {
      it('it should render the search template with body params taking precedence over the placement request params', async () => {
        const query = mapPlacementRequestToSpaceSearchParams(placementRequestDetail)
        const body = spaceSearchParametersUiFactory.build()

        const requestHandler = spaceSearchController.search()

        await requestHandler({ ...request, body }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a space',
          spaceSearchResults,
          placementRequest: placementRequestDetail,
          tier: placementRequestDetail.risks.tier.value.level,
          startDate: placementRequestDetail.expectedArrival,
          formPath,
          ...query,
          ...body,
        })
        expect(spaceService.search).toHaveBeenCalledWith(token, { ...query, ...body })
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      })
    })
  })

  describe('no body params are sent', () => {
    it('it should render the search template by searching with the placement request variables ', async () => {
      const query = mapPlacementRequestToSpaceSearchParams(placementRequestDetail)
      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/search',
        expect.objectContaining({
          pageHeading: 'Find a space',
          targetPostcodeDistrict: placementRequestDetail.location,
          spaceSearchResults,
          placementRequest: placementRequestDetail,
          tier: placementRequestDetail.risks.tier.value.level,
          startDate: placementRequestDetail.expectedArrival,
          formPath,
          ...query,
          ...mapPlacementRequestToSpaceSearchParams(placementRequestDetail),
        }),
      )
      expect(spaceService.search).toHaveBeenCalledWith(token, query)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })
})
