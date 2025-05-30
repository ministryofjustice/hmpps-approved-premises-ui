import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService } from '../../../services'
import {
  userDetailsFactory,
  cas1PlacementRequestDetailFactory,
  cas1ChangeRequestSummaryFactory,
} from '../../../testutils/factories'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { bookingSummaryList } from '../../../utils/bookings'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'

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
      const placementRequest = cas1PlacementRequestDetailFactory.build({
        openChangeRequests: cas1ChangeRequestSummaryFactory.buildList(2),
      })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      request.params.id = placementRequest.id

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/show', {
        adminIdentityBar: adminIdentityBar(placementRequest, response.locals.user),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        bookingSummaryList: placementSummaryList(placementRequest),
        changeRequestBanners: changeRequestBanners(
          placementRequest.id,
          placementRequest.openChangeRequests,
          response.locals.user,
        ),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
    })

    it('should render the placement request template with a legacy booking', async () => {
      const placementRequest = cas1PlacementRequestDetailFactory.withLegacyBooking().build()
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
