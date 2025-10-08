import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService, SessionService } from '../../../services'
import {
  userDetailsFactory,
  cas1PlacementRequestDetailFactory,
  cas1ChangeRequestSummaryFactory,
  cas1SpaceBookingSummaryFactory,
} from '../../../testutils/factories'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { placementsSummaries } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'
import { placementRadioItems, placementRequestKeyDetails } from '../../../utils/placementRequests/utils'
import adminPaths from '../../../paths/admin'
import managePaths from '../../../paths/manage'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { changePlacementLink } from '../../../utils/placementRequests/adminIdentityBar'

jest.mock('../../../utils/applications/utils')
jest.mock('../../../utils/applications/getResponses')
jest.mock('../../../utils/getPaginationDetails')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const sessionService = createMock<SessionService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.clearAllMocks()

    request = createMock<Request>({ user: { token }, flash: jest.fn() })

    placementRequestsController = new PlacementRequestsController(placementRequestService, sessionService)

    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')
  })

  describe('show', () => {
    it('should render the placement request template with a space booking', async () => {
      jest.spyOn(sessionService, 'getPageBackLink').mockReturnValue('/admin/cru-dashboard?status=unableToMatch&page=2')
      const placementRequest = cas1PlacementRequestDetailFactory.build({
        openChangeRequests: cas1ChangeRequestSummaryFactory.buildList(2),
      })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      request.params.placementRequestId = placementRequest.id

      await placementRequestsController.show()(request, response, next)

      expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
        '/admin/placement-requests/:placementRequestId',
        request,
        ['/admin/cru-dashboard', '/admin/cru-dashboard/change-requests', '/admin/cru-dashboard/search'],
      )
      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/show', {
        backlink: '/admin/cru-dashboard?status=unableToMatch&page=2',
        adminIdentityBar: adminIdentityBar(placementRequest, response.locals.user),
        changePlacementLink: changePlacementLink(placementRequest),
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

  describe('selectPlacement', () => {
    const departedPlacement = cas1SpaceBookingSummaryFactory.departed().build()
    const currentPlacement = cas1SpaceBookingSummaryFactory.upcoming().build()
    const upcomingPlacement = cas1SpaceBookingSummaryFactory.current().build()

    it('renders the form to select a placement to change, only showing upcoming or current placements', async () => {
      const placementRequest = cas1PlacementRequestDetailFactory.matched().build({
        spaceBookings: [departedPlacement, currentPlacement, upcomingPlacement],
      })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
      request.params.placementRequestId = placementRequest.id

      await placementRequestsController.selectPlacement()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/select-placement', {
        backlink: adminPaths.admin.placementRequests.show({ placementRequestId: placementRequest.id }),
        pageHeading: 'Which placement do you want to change?',
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRadioItems: placementRadioItems([currentPlacement, upcomingPlacement]),
        errors: {},
        errorSummary: [] as Array<string>,
      })
    })
  })

  describe('saveSelectPlacement', () => {
    it.each([
      ['no placement has been selected', {}],
      ['an invalid placement has been selected', { placementId: 'invalid-placement-id' }],
    ])('redirects to the form with an error if %s', async (_, body) => {
      const placementRequest = cas1PlacementRequestDetailFactory.withSpaceBooking().build()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      request.params.placementRequestId = placementRequest.id
      request.body = body

      await placementRequestsController.saveSelectPlacement()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        adminPaths.admin.placementRequests.selectPlacement({ placementRequestId: placementRequest.id }),
      )
      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data
      expect(errorData).toEqual({
        placementId: 'Select a placement to change',
      })
    })

    it('redirects to the change placement page for the selected placement', async () => {
      const placementRequest = cas1PlacementRequestDetailFactory.withSpaceBooking().build()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
      const placement = placementRequest.spaceBookings[0]
      request.params.placementRequestId = placementRequest.id
      request.body = {
        placementId: placement.id,
      }

      await placementRequestsController.saveSelectPlacement()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.changes.new({ premisesId: placement.premises.id, placementId: placement.id }),
      )
    })
  })
})
