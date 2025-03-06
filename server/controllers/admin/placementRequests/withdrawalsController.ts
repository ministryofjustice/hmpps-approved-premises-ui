import type { Request, RequestHandler, Response } from 'express'

import { placementApplicationWithdrawalReasons } from '../../../utils/applications/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import { PlacementRequestService } from '../../../services'
import { ErrorWithData } from '../../../utils/errors'
import { withdrawalMessage } from '../../../utils/placementRequests/utils'

export default class WithdrawalsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const withdrawalReasonsRadioItems = placementApplicationWithdrawalReasons(req.session.user)

      const applicationId = req.flash('applicationId')?.[0] || ''

      return res.render('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        id: req.params.id,
        applicationId,
        errors,
        errorSummary,
        withdrawalReasonsRadioItems,
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
        } catch (error) {
          req.flash('success', 'Placement application withdrawn')
        }
        return res.redirect(paths.admin.cruDashboard.index({}))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.admin.placementRequests.withdrawal.new({ id: req.params.id }),
        )
      }
    }
  }
}
