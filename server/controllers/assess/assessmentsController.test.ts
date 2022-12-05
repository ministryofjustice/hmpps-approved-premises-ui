import type { Request, Response, NextFunction } from 'express'
import type { GroupedAssessmentWithRisks } from '@approved-premises/ui'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import AssessmentsController from './assessmentsController'
import { AssessmentService } from '../../services'

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
      const assessments = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessmentWithRisks
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
})
