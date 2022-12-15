import type { Request, Response, NextFunction } from 'express'
import type { GroupedAssessments } from '@approved-premises/ui'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import AssessmentsController from './assessmentsController'
import { AssessmentService } from '../../services'

import assessmentFactory from '../../testutils/factories/assessment'
import Assess from '../../form-pages/assess'

describe('assessmentsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})

  let assessmentsController: AssessmentsController

  beforeEach(() => {
    assessmentsController = new AssessmentsController(assessmentService)
  })

  describe('index', () => {
    it('should list all the assessments for a user', async () => {
      const assessments = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments
      assessmentService.getAllForLoggedInUser.mockResolvedValue(assessments)
      const requestHandler = assessmentsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/index', {
        pageHeading: 'Approved Premises applications',
        assessments,
      })
      expect(assessmentService.getAllForLoggedInUser).toHaveBeenCalled()
    })
  })

  describe('show', () => {
    const assessment = assessmentFactory.build()

    beforeEach(() => {
      request.params.id = assessment.id

      assessmentService.findAssessment.mockResolvedValue(assessment)
    })

    it('fetches the assessment and renders the task list', async () => {
      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        sections: Assess.sections,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })
  })
})
