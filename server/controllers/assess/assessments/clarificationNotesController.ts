import type { Request, Response, RequestHandler } from 'express'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

import { AssessmentService } from '../../../services'

import paths from '../../../paths/assess'

export default class ClarificationNotesController {
  constructor(private readonly assessmentService: AssessmentService) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        await this.assessmentService.createClarificationNote(req.user.token, req.params.id, req.body)

        res.redirect(paths.assessments.clarificationNotes.confirm({ id: req.params.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.assessments.pages.show({
            id: req.params.id,
            task: 'suitability-assessment',
            page: 'request-information',
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      res.render('assessments/clarificationNotes/confirmation', { pageHeading: 'Note Created' })
    }
  }
}
