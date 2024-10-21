import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  cas1PremisesSummaryFactory,
  newPlacementRequestBookingConfirmationFactory,
  placementRequestDetailFactory,
} from '../../../testutils/factories'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/admin'
import { DateFormats } from '../../../utils/dateUtils'

import BookingsController from './bookingsController'

jest.mock('../../../utils/validation')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'
  const placementRequest = placementRequestDetailFactory.build({ expectedArrival: '2022-01-01', duration: 14 })

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, params: { id: placementRequest.id } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})

  let bookingsController: BookingsController

  beforeEach(() => {
    jest.resetAllMocks()
    bookingsController = new BookingsController(placementRequestService, premisesService)
  })

  describe('new', () => {
    const premises = cas1PremisesSummaryFactory.buildList(2)

    beforeEach(() => {
      jest.resetAllMocks()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
      premisesService.getCas1All.mockResolvedValue(premises)
    })

    it('should render the form with the premises and the placement request', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      ;(placementRequest.application as ApprovedPremisesApplication).isWomensApplication = false

      const requestHandler = bookingsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/bookings/new', {
        pageHeading: 'Record an Approved Premises (AP) placement',
        premises,
        placementRequest,
        errors: {},
        errorSummary: [],
        errorTitle: undefined,
        isWomensApplication: false,
        ...DateFormats.isoDateToDateInputs(placementRequest.expectedArrival, 'arrivalDate'),
        ...DateFormats.isoDateToDateInputs('2022-01-15', 'departureDate'),
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, { gender: 'man' })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
    })

    it(`should render the form for a women's AP with the premises and the placement request`, async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      ;(placementRequest.application as ApprovedPremisesApplication).isWomensApplication = true

      const requestHandler = bookingsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/bookings/new', {
        pageHeading: `Record a women’s Approved Premises placement`,
        premises,
        placementRequest,
        errors: {},
        errorSummary: [],
        errorTitle: undefined,
        isWomensApplication: true,
        ...DateFormats.isoDateToDateInputs(placementRequest.expectedArrival, 'arrivalDate'),
        ...DateFormats.isoDateToDateInputs('2022-01-15', 'departureDate'),
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, { gender: 'woman' })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
    })

    it('should render the form with the premises, the placement request and the errors when there is an error in the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      ;(placementRequest.application as ApprovedPremisesApplication).isWomensApplication = false

      const requestHandler = bookingsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/bookings/new', {
        pageHeading: 'Record an Approved Premises (AP) placement',
        premises,
        placementRequest,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        isWomensApplication: false,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    const body = {
      'arrivalDate-day': '1',
      'arrivalDate-month': '1',
      'arrivalDate-year': '2022',
      'departureDate-day': '1',
      'departureDate-month': '3',
      'departureDate-year': '2022',
      bedId: 'some-other-uuid',
    }

    it('successfully creates a booking', async () => {
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()

      placementRequestService.createBooking.mockResolvedValue(bookingConfirmation)

      const requestHandler = bookingsController.create()

      request.body = body

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', `Placement created for ${bookingConfirmation.premisesName}`)
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.placementRequests.show({ id: placementRequest.id }))
      expect(placementRequestService.createBooking).toHaveBeenCalledWith(token, placementRequest.id, {
        ...body,
        arrivalDate: '2022-01-01',
        departureDate: '2022-03-01',
      })
    })

    it('should call catchValidationErrorOrPropogate if there is an error', async () => {
      const err = new Error()

      placementRequestService.createBooking.mockImplementation(() => {
        throw err
      })

      const requestHandler = bookingsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.admin.placementRequests.bookings.new({ id: placementRequest.id }),
      )
    })
  })
})
