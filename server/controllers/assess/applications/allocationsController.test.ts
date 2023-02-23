import type { NextFunction, Request, Response } from 'express'

import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ErrorsAndUserInput } from '@approved-premises/ui'
import AllocationsController from './allocationsController'
import { ApplicationService, UserService } from '../../../services'
import { getQualificationsForApplication } from '../../../utils/applications/getQualificationsForApplication'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import assessmentFactory from '../../../testutils/factories/assessment'
import userFactory from '../../../testutils/factories/user'

import paths from '../../../paths/assess'

jest.mock('../../../utils/applications/getQualificationsForApplication')
jest.mock('../../../utils/validation')

describe('allocationsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const userService = createMock<UserService>({})

  let allocationsController: AllocationsController

  beforeEach(() => {
    allocationsController = new AllocationsController(applicationService, userService)
  })

  describe('show', () => {
    const assessment = assessmentFactory.build()
    const users = userFactory.buildList(3)
    const qualifications = ['foo', 'bar']

    beforeEach(() => {
      applicationService.getAssessment.mockResolvedValue(assessment)
      userService.getUsers.mockResolvedValue(users)
      ;(getQualificationsForApplication as jest.Mock).mockReturnValue(qualifications)
    })

    it('fetches the assessment and a list of qualified users', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = allocationsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/allocations/show', {
        pageHeading: `Assessment for ${assessment.application.person.name}`,
        assessment,
        users,
        errors: {},
        errorSummary: [],
      })

      expect(applicationService.getAssessment).toHaveBeenCalledWith(request.user.token, request.params.id)
      expect(userService.getUsers).toHaveBeenCalledWith(request.user.token, ['assessor'], qualifications)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = allocationsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/allocations/show', {
        pageHeading: `Assessment for ${assessment.application.person.name}`,
        assessment,
        users,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    beforeEach(() => {
      request.params.id = 'some-uuid'
      request.body.userId = 'some-other-uuid'
    })

    it('should set a flash message and redirect when the API returns correctly', async () => {
      const requestHandler = allocationsController.create()

      const staffMember = userFactory.build()
      const assessment = assessmentFactory.build({ allocatedToStaffMember: staffMember })
      applicationService.allocate.mockResolvedValue(assessment)

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', `Case has been allocated to ${staffMember.name}`)
      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.index({}))

      expect(applicationService.allocate).toHaveBeenCalledWith(token, request.params.id, request.body.userId)
    })

    it('should redirect with errors if the API returns an error', async () => {
      const requestHandler = allocationsController.create()

      const err = new Error()

      applicationService.allocate.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.allocations.show({ id: request.params.id }),
      )
    })
  })
})
