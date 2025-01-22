import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceSearchController from './spaceSearchController'
import {
  placementRequestDetailFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'

import { PlacementRequestService, SpaceService } from '../../../services'
import matchPaths from '../../../paths/match'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  initialiseSearchState,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
} from '../../../utils/match/spaceSearch'

describe('spaceSearchController', () => {
  const token = 'SOME_TOKEN'
  const placementRequestDetail = placementRequestDetailFactory.build()
  const spaceSearchResults = spaceSearchResultsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({
    params: { id: placementRequestDetail.id },
    user: { token },
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
    it('it should render the search template with the search state found in session', async () => {
      const searchState = spaceSearchStateFactory.build()
      spaceService.getSpaceSearchState.mockReturnValue(searchState)

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        spaceSearchResults,
        placementRequest: placementRequestDetail,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequestDetail, { showActions: false }),
        formPath,
        formValues: searchState,
        apTypeRadioItems: apTypeRadioItems(searchState.apType),
        criteriaCheckboxGroups: [
          checkBoxesForCriteria(
            'AP requirements',
            'apCriteria',
            spaceSearchCriteriaApLevelLabels,
            searchState.apCriteria,
          ),
          checkBoxesForCriteria(
            'Room requirements',
            'roomCriteria',
            spaceSearchCriteriaRoomLevelLabels,
            searchState.roomCriteria,
          ),
        ],
      })
      expect(spaceService.getSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(spaceService.search).toHaveBeenCalledWith(token, searchState)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should create the space search state if not found in session', async () => {
      const searchState = spaceSearchStateFactory.build()

      spaceService.getSpaceSearchState.mockReturnValue(undefined)
      spaceService.setSpaceSearchState.mockReturnValue(searchState)

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/search',
        expect.objectContaining({
          formValues: searchState,
        }),
      )
      expect(spaceService.getSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(spaceService.setSpaceSearchState).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        initialiseSearchState(placementRequestDetail),
      )
    })
  })
})
