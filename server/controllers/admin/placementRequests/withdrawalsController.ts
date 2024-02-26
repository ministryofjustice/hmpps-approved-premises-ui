import type { Request, RequestHandler, Response } from 'express'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import { PlacementRequestService } from '../../../services'
import { ErrorWithData } from '../../../utils/errors'
import { DateFormats } from '../../../utils/dateUtils'
import { placementLength } from '../../../utils/matchUtils'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawalsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      return res.render('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        id: req.params.id,
        errors,
        errorSummary,
        expectedArrival: placementRequest.expectedArrival,
        duration: placementRequest.duration,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { reason, expectedArrival, duration } = req.body as {
          reason: string | undefined
          expectedArrival: string | undefined
          duration: string
        }

        if (!reason) {
          throw new ErrorWithData({ 'invalid-params': [{ propertyName: `$.reason`, errorType: 'empty' }] })
        }

        await this.placementRequestService.withdraw(req.user.token, req.params.id, req.body.reason)

        req.flash(
          'success',
          `Placement request for ${placementLength(Number(duration))} starting on ${DateFormats.isoDateToUIDate(expectedArrival, { format: 'short' })} withdrawn successfully`,
        )
        return res.redirect(paths.admin.placementRequests.index({}))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.admin.placementRequests.withdrawal.new({ id: req.params.id }),
        )
      }
    }
  }
}
