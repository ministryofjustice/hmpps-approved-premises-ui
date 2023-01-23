import type { Request, Response, RequestHandler } from 'express'

import { AssessmentService, UserService } from '../../../services'

export default class ClarificationNotesController {
  constructor(private readonly assessmentService: AssessmentService, private readonly userService: UserService) {}

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const user = await this.userService.getUserById(req.user.token, assessment.application.createdByUserId)

      res.render('assessments/clarificationNotes/confirmation', {
        pageHeading: 'Request information from probation practitioner',
        user,
      })
    }
  }
}
