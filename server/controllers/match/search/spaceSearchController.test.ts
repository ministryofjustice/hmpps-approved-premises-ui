import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceSearchController from './spaceSearchController'
import { bedSearchResultsFactory, placementRequestDetailFactory } from '../../../testutils/factories'

import { PlacementRequestService, SpaceService } from '../../../services'
import { startDateObjFromParams } from '../../../utils/matchUtils'
import { mapPlacementRequestToBedSearchParams } from '../../../utils/placementRequests/utils'

import matchPaths from '../../../paths/match'

jest.mock('../../../utils/matchUtils')

describe('spaceSearchController', () => {
  const token = 'SOME_TOKEN'
  const placementRequestDetail = placementRequestDetailFactory.build()
  const spaceSearchResults = bedSearchResultsFactory.build()

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
    ;(startDateObjFromParams as jest.Mock).mockReturnValue({ startDate: placementRequestDetail.expectedArrival })
  })

  describe('search', () => {
    describe('body params are sent', () => {
      it('it should render the search template with body params taking precedence over the placement request params', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequestDetail)
        const body = { durationWeeks: '2', requiredCharacteristics: [] as Array<string> }

        const requestHandler = spaceSearchController.search()

        await requestHandler({ ...request, body }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a space',
          spaceSearchResults,
          placementRequest: placementRequestDetail,
          tier: placementRequestDetail.risks.tier.value.level,
          formPath,
          ...query,
          ...body,
        })
        expect(spaceService.search).toHaveBeenCalledWith(token, { ...query, ...body })
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      })

      it('should handle when a single selectedRequiredCharacteristic is sent', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequestDetail)
        const body = { requiredCharacteristics: placementRequestDetail.desirableCriteria[0] }

        const requestHandler = spaceSearchController.search()

        await requestHandler({ ...request, body }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a space',
          spaceSearchResults,
          placementRequest: placementRequestDetail,
          selectedDesirableCriteria: [placementRequestDetail.desirableCriteria[0]],
          tier: placementRequestDetail.risks.tier.value.level,
          formPath,
          ...query,
          requiredCharacteristics: [placementRequestDetail.desirableCriteria[0]],
        })
        expect(spaceService.search).toHaveBeenCalledWith(token, {
          ...query,
          ...{
            requiredCharacteristics: [placementRequestDetail.desirableCriteria[0]],
          },
        })
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      })
    })

    describe('no body params are sent', () => {
      it('it should render the search template by searching with the placement request variables ', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequestDetail)
        const requestHandler = spaceSearchController.search()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a space',
          spaceSearchResults,
          placementRequest: placementRequestDetail,
          selectedDesirableCriteria: placementRequestDetail.essentialCriteria,
          tier: placementRequestDetail.risks.tier.value.level,
          formPath,
          ...query,
        })
        expect(spaceService.search).toHaveBeenCalledWith(token, query)
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      })
    })
  })
})
