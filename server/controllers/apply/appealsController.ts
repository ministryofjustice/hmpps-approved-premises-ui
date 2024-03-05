import { Request, RequestHandler, Response } from 'express'
import AppealService from '../../services/appealService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'
import { AppealDecision, NewAppeal } from '../../@types/shared'
import paths from '../../paths/apply'
import { ApplicationService } from '../../services'

export default class AppealsController {
  constructor(
    private readonly appealService: AppealService,
    private readonly applicationService: ApplicationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationId = req.params.id
      const application = await this.applicationService.findApplication(req.user.token, applicationId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('applications/appeals/new', {
        application,
        applicationId,
        errors,
        errorSummary,
        pageHeading: 'Approved Premises Application',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationId = req.params.id
      const { body } = req

      const { appealDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'appealDate')

      const appeal: NewAppeal = {
        appealDate,
        appealDetail: body.appeal.appealDetail,
        decisionDetail: body.appeal.decisionDetail,
        decision: body.appeal.decision as AppealDecision,
      }

      try {
        await this.appealService.createAppeal(req.user.token, applicationId, appeal)

        const successMessage = appeal.decision === 'accepted' ? 'Assessment reopened' : 'Appeal marked as rejected'
        req.flash('success', successMessage)
        res.redirect(paths.applications.show({ id: applicationId }))
      } catch (error) {
        catchValidationErrorOrPropogate(req, res, error as Error, paths.applications.appeals.new({ id: applicationId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appeal = await this.appealService.getAppeal(req.user.token, req.params.id, req.params.appealId)
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      return res.render('appeals/show', { appeal, application })
    }
  }
}
