import type { Request, Response, NextFunction } from 'express'
import type { GroupedAssessments } from '@approved-premises/ui'

import { createMock, DeepMocked } from '@golevelup/ts-jest'

import AssessmentsController from './assessmentsController'
import { AssessmentService } from '../../services'

import assessmentFactory from '../../testutils/factories/assessment'

import paths from '../../paths/assess'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import getSections from '../../utils/assessments/getSections'

jest.mock('../../utils/assessments/utils')
jest.mock('../../utils/assessments/informationSetAsNotReceived')
jest.mock('../../utils/assessments/getSections')

describe('assessmentsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})

  let assessmentsController: AssessmentsController

  beforeEach(() => {
    assessmentsController = new AssessmentsController(assessmentService)
    response = createMock<Response>({})
    request = createMock<Request>({ user: { token } })
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
        sections: getSections(assessment),
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('redirects if the assessment is in a pending state and informationSetAsNotReceived is false', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)
      assessment.status = 'pending'

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.assessments.pages.show({
          id: assessment.id,
          task: 'sufficient-information',
          page: 'information-received',
        }),
      )

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('fetches the assessment and renders the task list  if the assessment is in a pending state and informationSetAsNotReceived is true', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(true)
      assessment.status = 'pending'

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        sections: getSections(assessment),
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })
  })
})
