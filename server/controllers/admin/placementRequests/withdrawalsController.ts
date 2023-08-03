import type { Request, RequestHandler, Response } from 'express'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import { PlacementRequestService } from '../../../services'
import { ErrorWithData } from '../../../utils/errors'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawlsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      return res.render('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Are you sure you want to withdraw this placement request?',
        id: req.params.id,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        if (!req.body.confirm) {
          throw new ErrorWithData({ 'invalid-params': [{ propertyName: `$.confirm`, errorType: 'empty' }] })
        }

        if (req.body.confirm === 'yes') {
          await this.placementRequestService.withdraw(req.user.token, req.params.id)

          req.flash('success', 'Placement request withdrawn successfully')
          return res.redirect(paths.admin.placementRequests.index({}))
        }

        req.flash('success', 'Placement request not withdrawn')
        return res.redirect(paths.admin.placementRequests.show({ id: req.params.id }))
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
