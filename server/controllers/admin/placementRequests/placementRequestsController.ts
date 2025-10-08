import type { Request, Response, TypedRequestHandler } from 'express'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'
import { PlacementRequestService, SessionService } from '../../../services'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { placementsSummaries } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'
import { placementRadioItems, placementRequestKeyDetails } from '../../../utils/placementRequests/utils'
import paths from '../../../paths/admin'
import managePaths from '../../../paths/manage'
import { ValidationError } from '../../../utils/errors'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { overallStatus } from '../../../utils/placements'
import { changePlacementLink } from '../../../utils/placementRequests/adminIdentityBar'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly sessionService: SessionService,
  ) {}

  show(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { placementRequestId } = req.params
      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      res.render('admin/placementRequests/show', {
        backlink: this.sessionService.getPageBackLink(paths.admin.placementRequests.show.pattern, req, [
          paths.admin.cruDashboard.index.pattern,
          paths.admin.cruDashboard.changeRequests.pattern,
          paths.admin.cruDashboard.search.pattern,
        ]),
        adminIdentityBar: adminIdentityBar(placementRequest, res.locals.user),
        changePlacementLink: changePlacementLink(placementRequest),
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        placements: placementsSummaries(placementRequest),
        changeRequestBanners: changeRequestBanners(
          placementRequestId,
          placementRequest.openChangeRequests,
          res.locals.user,
        ),
      })
    }
  }

  selectPlacement(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      const placementsToChange = placementRequest.spaceBookings.filter(placement =>
        ['upcoming', 'arrived'].includes(overallStatus(placement)),
      )

      res.render('admin/placementRequests/select-placement', {
        backlink: paths.admin.placementRequests.show({ placementRequestId }),
        pageHeading: 'Which placement do you want to change?',
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRadioItems: placementRadioItems(placementsToChange),
        errors,
        errorSummary,
      })
    }
  }

  saveSelectPlacement(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { placementRequestId } = req.params
      const { placementId } = req.body

      try {
        const placementRequest = await this.placementRequestService.getPlacementRequest(
          req.user.token,
          placementRequestId,
        )
        const placement = !!placementId && placementRequest.spaceBookings.find(p => p.id === placementId)

        if (!placement) {
          throw new ValidationError({
            placementId: 'Select a placement to change',
          })
        }

        res.redirect(
          managePaths.premises.placements.changes.new({ premisesId: placement.premises.id, placementId: placement.id }),
        )
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          paths.admin.placementRequests.selectPlacement({ placementRequestId }),
        )
      }
    }
  }
}
