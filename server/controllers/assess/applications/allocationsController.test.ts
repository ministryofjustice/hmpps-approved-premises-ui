import type { Request, Response, NextFunction } from 'express'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import AllocationsController from './allocationsController'
import { ApplicationService, UserService } from '../../../services'
import { getQualificationsForApplication } from '../../../utils/applications/getQualificationsForApplication'

import assessmentFactory from '../../../testutils/factories/assessment'
import userFactory from '../../../testutils/factories/user'

jest.mock('../../../utils/applications/getQualificationsForApplication')

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
    it('fetches the assessment and a list of qualified users', async () => {
      const requestHandler = allocationsController.show()

      const assessment = assessmentFactory.build()
      const users = userFactory.buildList(3)
      const qualifications = ['foo', 'bar']

      applicationService.getAssessment.mockResolvedValue(assessment)
      userService.getUsers.mockResolvedValue(users)
      ;(getQualificationsForApplication as jest.Mock).mockReturnValue(qualifications)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/allocations/show', {
        pageHeading: `Assessment for ${assessment.application.person.name}`,
        assessment,
        users,
      })

      expect(applicationService.getAssessment).toHaveBeenCalledWith(request.user.token, request.params.id)
      expect(userService.getUsers).toHaveBeenCalledWith(request.user.token, ['assessor'], qualifications)
    })
  })
})
