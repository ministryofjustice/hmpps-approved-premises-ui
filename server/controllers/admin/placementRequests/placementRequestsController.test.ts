import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService } from '../../../services'
import { userDetailsFactory } from '../../../testutils/factories'
import placementRequestDetail from '../../../testutils/factories/placementRequestDetail'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { bookingSummaryList } from '../../../utils/bookings'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'

jest.mock('../../../utils/applications/utils')
jest.mock('../../../utils/applications/getResponses')
jest.mock('../../../utils/getPaginationDetails')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestsController = new PlacementRequestsController(placementRequestService)
  })

  describe('show', () => {
    it('should render the placement request template with a space booking', async () => {
      const placementRequest = placementRequestDetail.build()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      request.params.id = 'some-uuid'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/show', {
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        bookingSummaryList: placementSummaryList(placementRequest),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, 'some-uuid')
    })

    it('should render the placement request template with a legacy booking', async () => {
      const placementRequest = placementRequestDetail.withLegacyBooking().build()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      request.params.id = 'some-uuid'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/placementRequests/show',
        expect.objectContaining({
          bookingSummaryList: bookingSummaryList(placementRequest.booking),
        }),
      )
    })
  })
})
