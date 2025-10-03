import type { Request, RequestHandler, Response } from 'express'

import {
  addErrorMessageToFlash,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/apply'
import adminPaths from '../../../paths/admin'
import { Cas1Application, NewWithdrawal, Withdrawables } from '../../../@types/shared'
import { SelectedWithdrawableType } from '../../../utils/applications/withdrawables'
import { ApplicationService, SessionService } from '../../../services'
import { applicationKeyDetails } from '../../../utils/applications/helpers'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class WithdrawalsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly sessionService: SessionService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { id } = req.params as { id: string | undefined }
      const selectedWithdrawableType = (req.body?.selectedWithdrawableType || req.query?.selectedWithdrawableType) as
        | SelectedWithdrawableType
        | undefined

      const [withdrawables, application]: [Withdrawables, Cas1Application] = await Promise.all([
        this.applicationService.getWithdrawablesWithNotes(req.user.token, id),
        this.applicationService.findApplication(req.user.token, id),
      ])

      if (selectedWithdrawableType === 'application') {
        return res.render('applications/withdrawals/new', {
          pageHeading: 'Do you want to withdraw this application?',
          contextKeyDetails: applicationKeyDetails(application),
          applicationId: req.params.id,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      const backLink = this.sessionService.getPageBackLink(paths.applications.withdraw.new.pattern, req, [
        adminPaths.admin.placementRequests.show.pattern,
        paths.applications.show.pattern,
        paths.applications.index.pattern,
      ])

      if (!selectedWithdrawableType) {
        return res.render('applications/withdrawables/new', {
          pageHeading: 'What do you want to withdraw?',
          contextKeyDetails: applicationKeyDetails(application),
          id,
          withdrawables: withdrawables.withdrawables,
          backLink,
          notes: withdrawables.notes,
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

        if (body.reason === 'other' && !body.otherReason?.trim()) {
          addErrorMessageToFlash(req, 'Enter a reason for withdrawing the application', 'otherReason')
          return res.redirect(
            `${paths.applications.withdraw.new({ id: req.params.id })}?selectedWithdrawableType=application`,
          )
        }

        await this.applicationService.withdraw(req.user.token, req.params.id, body)

        req.flash('success', 'Application withdrawn')
        return res.redirect(paths.applications.index({}))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.applications.withdraw.new({ id: req.params.id }),
        )
      }
    }
  }
}
