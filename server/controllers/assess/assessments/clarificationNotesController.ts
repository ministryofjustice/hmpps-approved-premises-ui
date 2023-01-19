import type { Request, Response, RequestHandler } from 'express'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

import { AssessmentService, UserService } from '../../../services'

import paths from '../../../paths/assess'

export default class ClarificationNotesController {
  constructor(private readonly assessmentService: AssessmentService, private readonly userService: UserService) {}

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
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const user = await this.userService.getUserById(req.user.token, assessment.application.createdByUserId)

      res.render('assessments/clarificationNotes/confirmation', {
        pageHeading: 'Request information from probation practicioner',
        user,
      })
    }
  }
}
