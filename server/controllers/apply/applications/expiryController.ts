import type { Request, RequestHandler, Response } from 'express'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/apply'
import { Cas1ExpireApplicationReason } from '../../../@types/shared'
import { ApplicationService, SessionService } from '../../../services'
import { applicationKeyDetails } from '../../../utils/applications/helpers'
import { ValidationError } from '../../../utils/errors'
import { getApplicationSummary } from '../../../utils/applications/utils'

export const tasklistPageHeading = 'Expire application'

export default class ExpiryController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly sessionService: SessionService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)
      const { id } = req.params as { id: string | undefined }

      const application = await this.applicationService.findApplication(req.user.token, id)

      const backLink = this.sessionService.getPageBackLink(paths.applications.expire.pattern, req, [
        paths.applications.show.pattern,
        paths.applications.index.pattern,
        paths.applications.dashboard.pattern,
      ])

      return res.render('applications/expiry/new', {
        backLink,
        contextKeyDetails: applicationKeyDetails(application),
        pageHeading: 'Expire application',
        summaryRows: getApplicationSummary(application),
        applicationId: id,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const body: Cas1ExpireApplicationReason = { reason: req.body.reason }
        if (!body.reason?.trim()) {
          throw new ValidationError({ reason: 'Give the reason for expiring this application' })
        }

        await this.applicationService.expire(req.user.token, req.params.id, body)

        const returnUrl = this.sessionService.getPageBackLink(paths.applications.expire.pattern, req, [])
        req.flash('success', 'Application marked as expired')
        return res.redirect(returnUrl)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.applications.expire({ id: req.params.id }),
        )
      }
    }
  }
}
