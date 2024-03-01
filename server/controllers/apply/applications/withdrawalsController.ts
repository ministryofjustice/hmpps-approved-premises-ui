import type { Request, RequestHandler, Response } from 'express'

import ApplicationService from '../../../services/applicationService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/apply'
import { NewWithdrawal } from '../../../@types/shared'
import { SelectedWithdrawableType } from '../../../utils/applications/withdrawables'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawalsController {
  constructor(private readonly applicationService: ApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { id } = req.params as { id: string | undefined }
      const selectedWithdrawableType = (req.body?.selectedWithdrawableType || req.query?.selectedWithdrawableType) as
        | SelectedWithdrawableType
        | undefined

      const withdrawables = await this.applicationService.getWithdrawables(req.user.token, id)

      if (selectedWithdrawableType === 'application' || process.env.NEW_WITHDRAWALS_FLOW_DISABLED) {
        return res.render('applications/withdrawals/new', {
          pageHeading: 'Do you want to withdraw this application?',
          applicationId: req.params.id,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      if (!selectedWithdrawableType) {
        return res.render('applications/withdrawables/new', {
          pageHeading: 'What do you want to withdraw?',
          id,
          withdrawables,
        })
      }

      return res.redirect(
        302,
        `${paths.applications.withdrawables.show({ id })}?selectedWithdrawableType=${selectedWithdrawableType}`,
      )
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
