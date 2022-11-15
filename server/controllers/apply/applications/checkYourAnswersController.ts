import type { Request, Response, RequestHandler } from 'express'

import { ApplicationService } from '../../../services'
import { sections } from '../../../form-pages/apply'

export default class CheckYourAnswers {
  constructor(private readonly applicationService: ApplicationService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      const responses = this.applicationService.getResponsesAsSummaryListItems(application)

      res.render('applications/check-your-answers', {
        pageHeading: 'Check your answers',
        sections,
        application,
        responses,
      })
    }
  }
}
