import type { Request, Response, NextFunction } from 'express'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ClarificationNotesController from './clarificationNotesController'
import { AssessmentService, UserService } from '../../../services'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

import clarificationNoteFactory from '../../../testutils/factories/clarificationNote'
import assessmentFactory from '../../../testutils/factories/assessment'
import userFactory from '../../../testutils/factories/user'

import paths from '../../../paths/assess'

jest.mock('../../../utils/validation')

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

  describe('create', () => {
    const id = 'some-uuid'
    const note = clarificationNoteFactory.build()

    beforeEach(() => {
      request.params.id = id
      request.body = note

      assessmentService.createClarificationNote.mockResolvedValue(note)
    })

    it('creates a note and renders the confirmation', async () => {
      const requestHandler = clarificationNotesController.create()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.clarificationNotes.confirm({ id }))

      expect(assessmentService.createClarificationNote).toHaveBeenCalledWith(token, id, note)
    })

    it('redirects with errors if the API returns an error', async () => {
      const requestHandler = clarificationNotesController.create()

      request.params = {
        id: 'some-uuid',
      }

      const err = new Error()

      assessmentService.createClarificationNote.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.assessments.pages.show({
          id,
          task: 'suitability-assessment',
          page: 'request-information',
        }),
      )
    })
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
