import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { Cas1NewSpaceBooking } from '@approved-premises/api'
import { SpaceSearchFormData } from '@approved-premises/ui'
import SpaceBookingsController from './spaceBookingsController'

import { PlacementRequestService, PremisesService, SpaceSearchService } from '../../../services'
import {
  cas1PlacementRequestDetailFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import * as validationUtils from '../../../utils/validation'
import * as matchUtils from '../../../utils/match'
import { DateFormats } from '../../../utils/dateUtils'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'

describe('SpaceBookingsController', () => {
  const token = 'SOME_TOKEN'

  let request: Readonly<DeepMocked<Request>>
  const mockSessionSave = jest.fn().mockImplementation((callback: () => void) => callback())
  const mockFlash = jest.fn()
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const spaceSearchService = createMock<SpaceSearchService>({})

  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build({ duration: 84 })
  const searchState = spaceSearchStateFactory.build()

  const params = { placementRequestId: placementRequestDetail.id, premisesId: premises.id }

  let spaceBookingsController: SpaceBookingsController

  beforeEach(() => {
    jest.clearAllMocks()

    spaceBookingsController = new SpaceBookingsController(placementRequestService, premisesService, spaceSearchService)
    request = createMock<Request>({
      user: { token },
      params,
      session: {
        save: mockSessionSave,
        multiPageFormData: { spaceSearch: { [placementRequestDetail.id]: searchState } },
      },
      flash: mockFlash,
    })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)
    jest.spyOn(spaceBookingsController.formData, 'get')
    jest.spyOn(spaceBookingsController.formData, 'remove')
  })

  describe('new', () => {
    it('should render the new space booking confirmation template based on search state', async () => {
      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(spaceBookingsController.formData.get).toHaveBeenCalledWith(params.placementRequestId, request.session)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/spaceBookings/new', {
        backLink: matchPaths.v2Match.placementRequests.search.occupancy(params),
        submitLink: matchPaths.v2Match.placementRequests.spaceBookings.create(params),
        contextKeyDetails: placementRequestKeyDetails(placementRequestDetail),
        premises,
        summaryListRows: matchUtils.spaceBookingConfirmationSummaryListRows({
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

    it("should render the summary list without AP area for a women's AP application", async () => {
      jest.spyOn(matchUtils, 'spaceBookingConfirmationSummaryListRows')

      const womensPlacementRequestDetail = cas1PlacementRequestDetailFactory.build({
        application: { isWomensApplication: true },
      })

      placementRequestService.getPlacementRequest.mockResolvedValue(womensPlacementRequestDetail)

      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(matchUtils.spaceBookingConfirmationSummaryListRows).toHaveBeenCalledWith(
        expect.objectContaining({
          isWomensApplication: true,
        }),
      )
    })

    it('should render the summary list with the reason for the new placement', async () => {
      jest.spyOn(matchUtils, 'spaceBookingConfirmationSummaryListRows')

      const searchStateWithReason: SpaceSearchFormData = {
        ...searchState,
        newPlacementReason: 'risk_to_resident',
        notes: 'Reason for the new placement',
        newPlacementCriteriaChanged: 'no',
      }
      request.session.multiPageFormData.spaceSearch = {
        [placementRequestDetail.id]: searchStateWithReason,
      }

      await spaceBookingsController.new()(request, response, next)

      expect(matchUtils.spaceBookingConfirmationSummaryListRows).toHaveBeenCalledWith(
        expect.objectContaining({
          newPlacementReason: 'risk_to_resident',
          notes: 'Reason for the new placement',
        }),
      )
    })

    it('redirects to the suitability search if no search state is present', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: params.placementRequestId }),
      )
    })

    it.each([
      ['no arrival date', { arrivalDate: undefined }],
      ['no departure date', { departureDate: undefined }],
      ['no arrival or departure date', { arrivalDate: undefined, departureDate: undefined }],
    ])('redirects to the availability search if %s is present in the search state', async (_, stateOverride) => {
      request.session.multiPageFormData.spaceSearch[placementRequestDetail.id] = { ...searchState, ...stateOverride }

      const requestHandler = spaceBookingsController.new()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.search.occupancy(params))
    })
  })

  describe('create', () => {
    it('redirects to the suitability search if no search state is present', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = spaceBookingsController.create()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: params.placementRequestId }),
      )
    })

    it('should call the createSpaceBooking method on the spaceSearchService and redirect the user to the CRU dashboard', async () => {
      const newSpaceBooking: Cas1NewSpaceBooking = {
        premisesId: premises.id,
        arrivalDate: searchState.arrivalDate,
        departureDate: searchState.departureDate,
        characteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
      }
      const spaceBooking = cas1SpaceBookingFactory.build()

      spaceSearchService.createSpaceBooking.mockResolvedValue(spaceBooking)

      await spaceBookingsController.create()(request, response, next)

      expect(spaceSearchService.createSpaceBooking).toHaveBeenCalledWith(
        token,
        placementRequestDetail.id,
        newSpaceBooking,
      )
      expect(mockFlash).toHaveBeenCalledWith('success', {
        heading: `Placement booked for ${spaceBooking.person.crn}`,
        body: `<ul><li><strong>Approved Premises:</strong> ${spaceBooking.premises.name}</li>
<li><strong>Date of application:</strong> ${DateFormats.isoDateToUIDate(placementRequestDetail.applicationDate, { format: 'short' })}</li></ul>
<p>A confirmation email will be sent to the AP and probation practitioner.</p>`,
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

    describe('when creating a new placement', () => {
      it('should create the new placement and redirect the user to the placement request page', async () => {
        const searchStateWithNewPlacement: SpaceSearchFormData = {
          ...searchState,
          newPlacementReason: 'risk_to_resident',
          notes: 'There was a need',
          newPlacementCriteriaChanged: 'no',
        }
        request.session.multiPageFormData.spaceSearch = {
          [placementRequestDetail.id]: searchStateWithNewPlacement,
        }

        const newSpaceBooking: Cas1NewSpaceBooking = {
          premisesId: premises.id,
          arrivalDate: searchStateWithNewPlacement.arrivalDate,
          departureDate: searchStateWithNewPlacement.departureDate,
          characteristics: [...searchStateWithNewPlacement.apCriteria, ...searchStateWithNewPlacement.roomCriteria],
          additionalInformation: searchStateWithNewPlacement.notes,
          transferReason: searchStateWithNewPlacement.newPlacementReason,
        }

        const spaceBooking = cas1SpaceBookingFactory.build()
        spaceSearchService.createSpaceBooking.mockResolvedValue(spaceBooking)

        await spaceBookingsController.create()(request, response, next)

        expect(spaceSearchService.createSpaceBooking).toHaveBeenCalledWith(
          token,
          placementRequestDetail.id,
          newSpaceBooking,
        )
        expect(mockFlash).toHaveBeenCalledWith('success', {
          heading: 'Placement created',
          body: matchUtils.creationNotificationBodyNewPlacement(spaceBooking),
        })
        expect(spaceBookingsController.formData.remove).toHaveBeenCalled()
        expect(response.redirect).toHaveBeenCalledWith(
          paths.admin.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
        )
      })
    })
  })
})
