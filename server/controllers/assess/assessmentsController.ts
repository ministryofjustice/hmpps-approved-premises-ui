import type { Request, Response, RequestHandler } from 'express'

import TasklistService from '../../services/tasklistService'
import { AssessmentService } from '../../services'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import { adjudicationsFromAssessment, caseNotesFromAssessment } from '../../utils/assessments/utils'

import getSections from '../../utils/assessments/getSections'

import paths from '../../paths/assess'
import { DateFormats } from '../../utils/dateUtils'

export const tasklistPageHeading = 'Assess an Approved Premises (AP) application'

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
      const noteAwaitingResponse = assessment.status === 'pending' && !informationSetAsNotReceived(assessment)
      const taskList = new TasklistService(assessment)

      if (noteAwaitingResponse) {
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
          pageHeading: tasklistPageHeading,
          taskList,
        })
      }
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

      if (req.body?.confirmation !== 'confirmed') {
        const errorMessage = 'You must confirm the information provided is complete, accurate and up to date.'
        const errorObject = { text: errorMessage }

        return res.render('assessments/show', {
          assessment,
          errorSummary: [
            {
              text: errorMessage,
              href: '#confirmation',
            },
          ],
          errorObject,
          pageHeading: tasklistPageHeading,
          sections: getSections(assessment),
        })
      }

      await this.assessmentService.submit(req.user.token, assessment)

      return res.render('assessments/confirm', {
        pageHeading: 'Assessment submission confirmed',
        assessment,
      })
    }
  }

  prisonInformation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)

      res.render('assessments/pages/risk-information/prison-information', {
        adjudications: adjudicationsFromAssessment(assessment),
        caseNotes: caseNotesFromAssessment(assessment),
        pageHeading: 'Prison information',
        dateOfImport: DateFormats.isoDateToUIDate(assessment.application.submittedAt),
        assessmentId: assessment.id,
      })
    }
  }
}
