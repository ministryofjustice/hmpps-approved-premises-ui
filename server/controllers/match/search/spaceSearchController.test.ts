import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceSearchController from './spaceSearchController'
import {
  placementRequestDetailFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'

import { PlacementRequestService, SpaceSearchService } from '../../../services'
import matchPaths from '../../../paths/match'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import {
  SpaceSearchState,
  apTypeRadioItems,
  checkBoxesForCriteria,
  initialiseSearchState,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
} from '../../../utils/match/spaceSearch'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import paths from '../../../paths/admin'

describe('spaceSearchController', () => {
  const token = 'SOME_TOKEN'
  const placementRequestDetail = placementRequestDetailFactory.build()
  const spaceSearchResults = spaceSearchResultsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({
    params: { id: placementRequestDetail.id },
    user: { token },
    session: {},
    flash: jest.fn(),
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const spaceSearchService = createMock<SpaceSearchService>({})
  const placementRequestService = createMock<PlacementRequestService>({})

  let spaceSearchController: SpaceSearchController

  const searchPath = matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequestDetail.id })

  beforeEach(() => {
    jest.resetAllMocks()
    spaceSearchController = new SpaceSearchController(spaceSearchService, placementRequestService)

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    spaceSearchService.search.mockResolvedValue(spaceSearchResults)
  })

  describe('search', () => {
    it('it should render the search template with the search state found in session', async () => {
      const searchState = spaceSearchStateFactory.build()
      spaceSearchService.getSpaceSearchState.mockReturnValue(searchState)

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        spaceSearchResults,
        placementRequest: placementRequestDetail,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequestDetail, { showActions: false }),
        formPath: searchPath,
        ...searchState,
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
        errors: {},
        errorSummary: [],
      })
      expect(spaceSearchService.getSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(spaceSearchService.search).toHaveBeenCalledWith(token, searchState)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should create the space search state if not found in session', async () => {
      const searchState = spaceSearchStateFactory.build()

      spaceSearchService.getSpaceSearchState.mockReturnValue(undefined)
      spaceSearchService.setSpaceSearchState.mockReturnValue(searchState)

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/search',
        expect.objectContaining({
          ...searchState,
        }),
      )
      expect(spaceSearchService.getSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        initialiseSearchState(placementRequestDetail),
      )
    })

    it('should clear the search state if coming from the placement request page', async () => {
      request.headers.referer = `http://localhost${paths.admin.placementRequests.show({ id: placementRequestDetail.id })}`

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(spaceSearchService.removeSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
    })

    it('should render search errors and user input', async () => {
      const expectedErrors = {
        postcode: {
          text: 'Enter a postcode',
          attributes: { 'data-cy-error-postcode': true },
        },
      }
      const expectedErrorSummary = [
        {
          text: 'Enter a postcode yo',
          href: '#postcode',
        },
      ]
      const expectedUserInput = {
        postcode: '',
      }

      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue({
        errors: expectedErrors,
        errorSummary: expectedErrorSummary,
        userInput: expectedUserInput,
      })

      const searchState = spaceSearchStateFactory.build()
      spaceSearchService.getSpaceSearchState.mockReturnValue(searchState)

      const requestHandler = spaceSearchController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/search',
        expect.objectContaining({
          errors: expectedErrors,
          errorSummary: expectedErrorSummary,
          ...searchState,
          postcode: expectedUserInput.postcode,
        }),
      )
    })
  })

  describe('filterSearch', () => {
    const searchParams: Partial<SpaceSearchState> = {
      postcode: 'M14',
      apType: 'isMHAPElliottHouse',
      apCriteria: ['acceptsSexOffenders', 'isCatered'],
      roomCriteria: ['isArsonSuitable', 'hasEnSuite', 'isSingle'],
    }

    it('saves the submitted filters in the search state and redirects to the view', async () => {
      const requestHandler = spaceSearchController.filterSearch()
      await requestHandler({ ...request, body: searchParams }, response, next)

      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        searchParams,
      )
      expect(response.redirect).toHaveBeenCalledWith(searchPath)
    })

    it('clears the selected criteria when none are selected', async () => {
      const searchParamsNoCriteria: Partial<SpaceSearchState> = {
        ...searchParams,
        apCriteria: undefined,
        roomCriteria: undefined,
      }

      const requestHandler = spaceSearchController.filterSearch()
      await requestHandler({ ...request, body: searchParamsNoCriteria }, response, next)

      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        expect.objectContaining({
          apCriteria: [],
          roomCriteria: [],
        }),
      )
    })

    it('returns an error if the postcode is missing', async () => {
      jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')

      const searchParamsNoPostcode: Partial<SpaceSearchState> = {
        ...searchParams,
        postcode: undefined,
      }

      const requestHandler = spaceSearchController.filterSearch()
      await requestHandler({ ...request, body: searchParamsNoPostcode }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        searchPath,
      )
      expect(spaceSearchService.setSpaceSearchState).not.toHaveBeenCalled()

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        postcode: 'Enter a postcode',
      })
    })
  })
})
