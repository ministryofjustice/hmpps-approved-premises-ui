import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { Cas1NewSpaceBooking } from '@approved-premises/api'
import SpaceBookingsController from './spaceBookingsController'

import { PlacementRequestService, PremisesService, SpaceSearchService } from '../../../services'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  placementRequestDetailFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import * as validationUtils from '../../../utils/validation'
import { spaceBookingConfirmationSummaryListRows } from '../../../utils/match'

describe('SpaceBookingsController', () => {
  const token = 'SOME_TOKEN'

  let request: Readonly<DeepMocked<Request>>
  const mockSessionSave = jest.fn().mockImplementation((callback: () => void) => callback())
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const spaceSearchService = createMock<SpaceSearchService>({})

  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = placementRequestDetailFactory.build({ duration: 84 })
  const searchState = spaceSearchStateFactory.build()

  const params = { id: placementRequestDetail.id, premisesId: premises.id }

  let spaceBookingsController: SpaceBookingsController

  beforeEach(() => {
    jest.clearAllMocks()

    spaceBookingsController = new SpaceBookingsController(placementRequestService, premisesService, spaceSearchService)
    request = createMock<Request>({
      user: { token },
      params,
      session: {
        save: mockSessionSave,
      },
      flash: jest.fn(),
    })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)
    spaceSearchService.getSpaceSearchState.mockReturnValue(searchState)
  })

  describe('new', () => {
    it('should render the new space booking confirmation template based on search state', async () => {
      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(spaceSearchService.getSpaceSearchState).toHaveBeenCalledWith(params.id, request.session)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/spaceBookings/new', {
        backLink: matchPaths.v2Match.placementRequests.search.occupancy(params),
        submitLink: matchPaths.v2Match.placementRequests.spaceBookings.create(params),
        placementRequest: placementRequestDetail,
        premises,
        summaryListRows: spaceBookingConfirmationSummaryListRows({
          premises,
          expectedArrivalDate: searchState.arrivalDate,
          expectedDepartureDate: searchState.departureDate,
          criteria: searchState.roomCriteria,
          releaseType: placementRequestDetail.releaseType,
        }),
        errorSummary: [],
        errors: {},
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
    })

    it('redirects to the suitability search if no search state is present', async () => {
      spaceSearchService.getSpaceSearchState.mockReturnValue(undefined)

      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ id: params.id }),
      )
    })

    it.each([
      ['no arrival date', { arrivalDate: undefined }],
      ['no departure date', { departureDate: undefined }],
      ['no arrival or departure date', { arrivalDate: undefined, departureDate: undefined }],
    ])('redirects to the availability search if %s is present in the search state', async (_, stateOverride) => {
      spaceSearchService.getSpaceSearchState.mockReturnValue({ ...searchState, ...stateOverride })

      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.search.occupancy(params))
    })
  })

  describe('create', () => {
    it('should call the createSpaceBooking method on the spaceSearchService and redirect the user to the CRU dashboard', async () => {
      const newSpaceBooking: Cas1NewSpaceBooking = {
        premisesId: premises.id,
        arrivalDate: searchState.arrivalDate,
        departureDate: searchState.departureDate,
        requirements: {
          essentialCharacteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
        },
      }
      const spaceBooking = cas1SpaceBookingFactory.build()

      spaceSearchService.createSpaceBooking.mockResolvedValue(spaceBooking)
      const flash = jest.fn()

      const requestHandler = spaceBookingsController.create()
      await requestHandler({ ...request, flash }, response, next)

      expect(spaceSearchService.createSpaceBooking).toHaveBeenCalledWith(
        token,
        placementRequestDetail.id,
        newSpaceBooking,
      )
      expect(flash).toHaveBeenCalledWith('success', {
        heading: `Place booked for ${spaceBooking.person.crn} at ${spaceBooking.premises.name}`,
        body: `<p>A confirmation email will be sent to the AP and probation practitioner.</p>`,
      })
      expect(mockSessionSave).toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(`${paths.admin.cruDashboard.index({})}?status=matched`)
    })

    describe('when errors are raised by the API', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue()
      })

      it('redirects to the confirm screen', async () => {
        const apiError = new Error()
        spaceSearchService.createSpaceBooking.mockRejectedValue(apiError)

        const requestHandler = spaceBookingsController.create()
        await requestHandler(request, response, next)

        const expectedRedirect = matchPaths.v2Match.placementRequests.spaceBookings.new(params)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          apiError,
          expectedRedirect,
        )
      })
    })
  })
})
