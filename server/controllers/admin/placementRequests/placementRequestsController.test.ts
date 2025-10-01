import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService, SessionService } from '../../../services'
import {
  userDetailsFactory,
  cas1PlacementRequestDetailFactory,
  cas1ChangeRequestSummaryFactory,
} from '../../../testutils/factories'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { placementsSummaries } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'

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
  const sessionService = createMock<SessionService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestsController = new PlacementRequestsController(placementRequestService, sessionService)
  })

  describe('show', () => {
    it('should render the placement request template with a space booking', async () => {
      jest.spyOn(sessionService, 'getPageBackLink').mockReturnValue('/admin/cru-dashboard?status=unableToMatch&page=2')
      const placementRequest = cas1PlacementRequestDetailFactory.build({
        openChangeRequests: cas1ChangeRequestSummaryFactory.buildList(2),
      })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      request.params.placementRequestId = placementRequest.id

      await requestHandler(request, response, next)

      expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
        '/admin/placement-requests/:placementRequestId',
        request,
        ['/admin/cru-dashboard', '/admin/cru-dashboard/change-requests', '/admin/cru-dashboard/search'],
      )
      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/show', {
        backlink: '/admin/cru-dashboard?status=unableToMatch&page=2',
        adminIdentityBar: adminIdentityBar(placementRequest, response.locals.user),
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        placements: placementsSummaries(placementRequest),
        changeRequestBanners: changeRequestBanners(
          placementRequest.id,
          placementRequest.openChangeRequests,
          response.locals.user,
        ),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
    })
  })
})
