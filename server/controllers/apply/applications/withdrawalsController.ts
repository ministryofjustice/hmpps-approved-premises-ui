import type { Request, RequestHandler, Response } from 'express'

import ApplicationService from '../../../services/applicationService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/apply'
import { NewWithdrawal } from '../../../@types/shared'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawlsController {
  constructor(private readonly applicationService: ApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render('applications/withdrawals/new', {
        pageHeading: 'Do you want to withdraw this application?',
        applicationId: req.params.id,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const body: NewWithdrawal = { reason: req.body.reason, otherReason: req.body.otherReason }
        await this.applicationService.withdraw(req.user.token, req.params.id, body)

        req.flash('success', 'Application withdrawn')
        return res.redirect(paths.applications.index({}))
      } catch (err) {
        return catchValidationErrorOrPropogate(req, res, err, paths.applications.withdraw.new({ id: req.params.id }))
      }
    }
  }
}
