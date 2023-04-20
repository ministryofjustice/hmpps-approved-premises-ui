import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BookingsController from './bookingsController'

import { PlacementRequestService } from '../../../services'
import { bedSearchResultFactory, personFactory, placementRequestFactory } from '../../../testutils/factories'
import { encodeBedSearchResult, placementDates } from '../../../utils/matchUtils'

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
      const placementRequest = placementRequestFactory.build({ person })
      const bedSearchResult = bedSearchResultFactory.build()

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const query = {
        bedSearchResult: encodeBedSearchResult(bedSearchResult),
        startDate: '2022-01-01',
        durationWeeks: '2',
      }

      const params = { id: placementRequest.id }

      const requestHandler = bookingsController.confirm()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/bookings/confirm', {
        pageHeading: 'Confirm booking',
        person,
        bedSearchResult,
        dates: placementDates(query.startDate, query.durationWeeks),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
    })
  })
})
