import type { Request, RequestHandler, Response } from 'express'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import { PlacementRequestService } from '../../../services'
import { ErrorWithData } from '../../../utils/errors'
import { withdrawalMessage } from '../../../utils/placementRequests/utils'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawalsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      return res.render('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        id: req.params.id,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { reason } = req.body as {
          reason: string | undefined
          expectedArrival: string | undefined
          duration: string
        }

        if (!reason) {
          throw new ErrorWithData({ 'invalid-params': [{ propertyName: `$.reason`, errorType: 'empty' }] })
        }

        const placementRequest = await this.placementRequestService.withdraw(
          req.user.token,
          req.params.id,
          req.body.reason,
        )

        try {
          req.flash('success', withdrawalMessage(placementRequest.duration, placementRequest.expectedArrival))
        } catch (e) {
          req.flash('success', 'Placement application withdrawn')
        }
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
