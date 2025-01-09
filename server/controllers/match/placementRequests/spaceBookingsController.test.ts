import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import SpaceBookingsController from './spaceBookingsController'

import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  placementRequestDetailFactory,
  spaceBookingRequirementsFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import * as validationUtils from '../../../utils/validation'
import { createQueryString } from '../../../utils/utils'
import { spaceBookingConfirmationSummaryListRows } from '../../../utils/match'

describe('SpaceBookingsController', () => {
  const token = 'SOME_TOKEN'

  let request: Readonly<DeepMocked<Request>>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const spaceService = createMock<SpaceService>({})

  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = placementRequestDetailFactory.build({ duration: 84 })

  let spaceBookingsController: SpaceBookingsController

  beforeEach(() => {
    jest.resetAllMocks()
    spaceBookingsController = new SpaceBookingsController(placementRequestService, premisesService, spaceService)
    request = createMock<Request>({ user: { token } })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    when(validationUtils.fetchErrorsAndUserInput as jest.Mock)
      .calledWith(request)
      .mockReturnValue({
        errors: {},
        errorSummary: [],
        userInput: {},
      })
  })

  describe('new', () => {
    it('should render the new space booking confirmation template', async () => {
      const startDate = '2024-07-20'
      const durationDays = '84'
      const criteria: Array<Cas1SpaceBookingCharacteristic> = ['hasEnSuite', 'isArsonSuitable']
      const arrivalDate = '2024-07-26'
      const departureDate = '2024-09-04' // 40 days later

      const query = {
        startDate,
        durationDays,
        criteria,
        arrivalDate,
        departureDate,
      }

      const params = { id: placementRequestDetail.id, premisesId: premises.id }

      const requestHandler = spaceBookingsController.new()

      await requestHandler({ ...request, params, query }, response, next)

      const expectedSubmitLink = `${matchPaths.v2Match.placementRequests.spaceBookings.create(params)}?startDate=2024-07-20&durationDays=84&criteria=hasEnSuite&criteria=isArsonSuitable&arrivalDate=2024-07-26&departureDate=2024-09-04`
      const expectedBackLink = `${matchPaths.v2Match.placementRequests.search.occupancy(params)}?startDate=2024-07-20&durationDays=84&criteria=hasEnSuite&criteria=isArsonSuitable`

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/spaceBookings/new', {
        backLink: expectedBackLink,
        submitLink: expectedSubmitLink,
        placementRequest: placementRequestDetail,
        premises,
        arrivalDate,
        departureDate,
        criteria,
        summaryListRows: spaceBookingConfirmationSummaryListRows(
          placementRequestDetail,
          premises,
          arrivalDate,
          departureDate,
          criteria,
        ),
        errorSummary: [],
        errors: {},
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
    })
  })

  describe('create', () => {
    it.each([
      ['empty', { essentialCharacteristics: [] }],
      ['populated', {}],
    ])(
      'should call the createSpaceBooking method on the spaceService and redirect the user to the CRU dashboard with characteristics %s',
      async (_, requirementsOverride) => {
        const requirements = spaceBookingRequirementsFactory.build(requirementsOverride)
        const newSpaceBooking = newSpaceBookingFactory.build({ premisesId: premises.id, requirements })
        const spaceBooking = cas1SpaceBookingFactory.build()

        const body = {
          arrivalDate: newSpaceBooking.arrivalDate,
          departureDate: newSpaceBooking.departureDate,
          criteria: newSpaceBooking.requirements.essentialCharacteristics.toString(),
        }
        const params = { id: placementRequestDetail.id, premisesId: premises.id }

        spaceService.createSpaceBooking.mockResolvedValue(spaceBooking)
        const flash = jest.fn()

        const requestHandler = spaceBookingsController.create()
        await requestHandler({ ...request, flash, params, body }, response, next)

        expect(spaceService.createSpaceBooking).toHaveBeenCalledWith(token, placementRequestDetail.id, newSpaceBooking)
        expect(flash).toHaveBeenCalledWith(
          'success',
          `You have now booked a place in this AP for this person. An email will be sent to the AP, to inform them of the booking.`,
        )
        expect(response.redirect).toHaveBeenCalledWith(`${paths.admin.cruDashboard.index({})}?status=matched`)
      },
    )

    describe('when errors are raised by the API', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue()
      })

      it('redirects to the confirm screen maintaining the query string', async () => {
        const body = newSpaceBookingFactory.build()
        const params = { id: placementRequestDetail.id, premisesId: premises.id }
        const query = { startDate: '2025-06-12', durationDays: '84', criteria: ['hasEnSuite'] }

        const apiError = new Error()
        spaceService.createSpaceBooking.mockRejectedValue(apiError)

        const requestHandler = spaceBookingsController.create()
        await requestHandler({ ...request, params, query, body }, response, next)

        const expectedRedirect = `${matchPaths.v2Match.placementRequests.spaceBookings.new({
          id: placementRequestDetail.id,
          premisesId: premises.id,
        })}?${createQueryString(query)}`

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
