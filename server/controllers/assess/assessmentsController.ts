import type { Request, RequestHandler, Response } from 'express'

import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { AssessmentGroupingCategory } from '@approved-premises/ui'
import TasklistService from '../../services/tasklistService'
import { AssessmentService } from '../../services'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import { groupAssessmements } from '../../utils/assessments/utils'

import getSections from '../../utils/assessments/getSections'
import paths from '../../paths/assess'
import { hasRole } from '../../utils/userUtils'

export const tasklistPageHeading = 'Assess an Approved Premises (AP) application'

export default class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      let assessments: Array<Assessment>
      let groupingCategory: AssessmentGroupingCategory = 'status'

      if (hasRole(res.locals.user, 'workflow_manager')) {
        if (req.query.type === 'myAssessments') {
          assessments = await this.assessmentService.getAllForUser(req.user.token, res.locals.user.id)
        } else {
          assessments = await this.assessmentService.getAll(req.user.token)
          groupingCategory = 'allocation'
        }
      } else {
        assessments = await this.assessmentService.getAll(req.user.token)
      }

      res.render('assessments/index', {
        pageHeading: 'Approved Premises applications',
        assessments: groupAssessmements(assessments, groupingCategory),
        type: req.query.type,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const noteAwaitingResponse = assessment.status === 'pending' && !informationSetAsNotReceived(assessment)

      if (assessment.status === 'completed') {
        res.render('assessments/show', {
          assessment,
        })
      } else if (noteAwaitingResponse) {
        res.redirect(
          paths.assessments.pages.show({
            id: assessment.id,
            task: 'sufficient-information',
            page: 'information-received',
          }),
        )
      } else {
        const taskList = new TasklistService(assessment)

        res.render('assessments/tasklist', {
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
}
