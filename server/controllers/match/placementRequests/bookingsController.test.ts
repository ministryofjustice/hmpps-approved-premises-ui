import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BookingsController from './bookingsController'

import { PlacementRequestService } from '../../../services'
import {
  bedSearchResultFactory,
  newPlacementRequestBookingConfirmationFactory,
  personFactory,
  placementRequestDetailFactory,
} from '../../../testutils/factories'
import { encodeBedSearchResult, placementDates } from '../../../utils/matchUtils'
import { NewBookingNotMade } from '../../../@types/shared'

import matchPaths from '../../../paths/match'
import adminPaths from '../../../paths/admin'

describe('BookingsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})

  let bookingsController: BookingsController

  beforeEach(() => {
    jest.resetAllMocks()
    bookingsController = new BookingsController(placementRequestService)
  })

  describe('confirm', () => {
    it('should render the confirmation template', async () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequestDetail = placementRequestDetailFactory.build({ person })
      const bedSearchResult = bedSearchResultFactory.build()

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)

      const query = {
        bedSearchResult: encodeBedSearchResult(bedSearchResult),
        startDate: '2022-01-01',
        duration: '4',
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = bookingsController.confirm()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/bookings/confirm', {
        pageHeading: 'Confirm booking',
        placementRequest: placementRequestDetail,
        bedSearchResult,
        dates: placementDates(query.startDate, query.duration),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })

  describe('create', () => {
    it('should create a booking and render a success page', async () => {
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()

      placementRequestService.createBooking.mockResolvedValue(bookingConfirmation)

      const body = {
        arrivalDate: '2022-01-01',
        departureDate: '2022-03-01',
        bedId: 'some-other-uuid',
      }

      const params = { id: 'some-uuid' }

      const requestHandler = bookingsController.create()

      await requestHandler({ ...request, params, body }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/bookings/success', {
        pageHeading: 'Your booking is complete',
        bookingConfirmation,
      })
      expect(placementRequestService.createBooking).toHaveBeenCalledWith(token, 'some-uuid', body)
    })
  })

  describe('bookingNotMade', () => {
    it('should render the booking not made confirmation template', async () => {
      const placementRequestId = '123'
      const requestHandler = bookingsController.bookingNotMade()
      await requestHandler({ ...request, params: { id: placementRequestId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/bookings/unable-to-match', {
        pageHeading: 'Unable to match',
        confirmPath: matchPaths.placementRequests.bookingNotMade.create({ id: placementRequestId }),
      })
    })
  })

  describe('createBookingNotMade', () => {
    it('should call the service and redirect to the index page', async () => {
      const placementRequestId = '123'
      const body: NewBookingNotMade = {
        notes: 'Some notes',
      }
      const flash = jest.fn()

      const requestHandler = bookingsController.createBookingNotMade()
      await requestHandler({ ...request, params: { id: placementRequestId }, body, flash }, response, next)

      expect(flash).toHaveBeenCalledWith('success', 'Placement request marked unable to match')
      expect(response.redirect).toHaveBeenCalledWith(adminPaths.admin.placementRequests.index({}))
      expect(placementRequestService.bookingNotMade).toHaveBeenCalledWith(token, placementRequestId, body)
    })
  })
})
