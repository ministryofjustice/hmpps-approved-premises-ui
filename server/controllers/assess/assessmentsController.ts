import type { Request, Response, RequestHandler } from 'express'

import { AssessmentService } from '../../services'
import Assess from '../../form-pages/assess'

import paths from '../../paths/assess'

export default class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessments = await this.assessmentService.getAllForLoggedInUser(req.user.token)

      res.render('assessments/index', { pageHeading: 'Approved Premises applications', assessments })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

      if (assessment.status === 'pending') {
        res.redirect(
          paths.assessments.pages.show({
            id: assessment.id,
            task: 'sufficient-information',
            page: 'information-received',
          }),
        )
      } else {
        res.render('assessments/show', {
          assessment,
          pageHeading: 'Assess an Approved Premises (AP) application',
          sections: Assess.sections,
        })
      }
    }
  }
}
