import type { Request, Response, NextFunction } from 'express'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ClarificationNotesController from './clarificationNotesController'
import { AssessmentService, UserService } from '../../../services'

import assessmentFactory from '../../../testutils/factories/assessment'
import userFactory from '../../../testutils/factories/user'

describe('clarificationNotesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})
  const userService = createMock<UserService>({})

  let clarificationNotesController: ClarificationNotesController

  beforeEach(() => {
    clarificationNotesController = new ClarificationNotesController(assessmentService, userService)
  })

  describe('confirm', () => {
    it('fetches the assessment and user and renders the template', async () => {
      const requestHandler = clarificationNotesController.confirm()

      const assessment = assessmentFactory.build()
      const user = userFactory.build()

      assessmentService.findAssessment.mockResolvedValue(assessment)
      userService.getUserById.mockResolvedValue(user)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/clarificationNotes/confirmation', {
        pageHeading: 'Request information from probation practicioner',
        user,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(request.user.token, request.params.id)
      expect(userService.getUserById).toHaveBeenCalledWith(request.user.token, assessment.application.createdByUserId)
    })
  })
})
