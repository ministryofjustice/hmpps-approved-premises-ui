import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BookingsController from './bookingsController'

import { PlacementRequestService } from '../../../services'
import { NewBookingNotMade } from '../../../@types/shared'
import * as backlinkUtils from '../../../utils/backlinks'

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
    jest.spyOn(backlinkUtils, 'getPageBackLink').mockReturnValue('/backlink')
    bookingsController = new BookingsController(placementRequestService)
  })

  describe('bookingNotMade', () => {
    it('should render the booking not made confirmation template', async () => {
      const placementRequestId = '123'
      const requestHandler = bookingsController.bookingNotMade()
      await requestHandler({ ...request, params: { placementRequestId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/bookings/unable-to-match', {
        backLink: '/backlink',
        pageHeading: 'Mark as unable to book',
        confirmPath: matchPaths.placementRequests.bookingNotMade.create({ placementRequestId }),
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
      await requestHandler({ ...request, params: { placementRequestId }, body, flash }, response, next)

      expect(flash).toHaveBeenCalledWith('success', 'Placement request has been marked as  unable to book')
      expect(response.redirect).toHaveBeenCalledWith(adminPaths.admin.cruDashboard.index({}))
      expect(placementRequestService.bookingNotMade).toHaveBeenCalledWith(token, placementRequestId, body)
    })
  })
})
