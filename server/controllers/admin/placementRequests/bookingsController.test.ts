import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BookingsController from './bookingsController'

import { PlacementRequestService, PremisesService } from '../../../services'
import { placementRequestDetailFactory, premisesFactory } from '../../../testutils/factories'

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
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
    it('should render the form with the premises and the placement request', async () => {
      const placementRequest = placementRequestDetailFactory.build()
      const premises = premisesFactory.buildList(2)

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
      premisesService.getAll.mockResolvedValue(premises)

      const requestHandler = bookingsController.new()

      request.params.id = 'some-uuid'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/bookings/new', {
        pageHeading: 'Create a placement',
        premises,
        placementRequest,
      })

      expect(premisesService.getAll).toHaveBeenCalledWith(token)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, 'some-uuid')
    })
  })
})
