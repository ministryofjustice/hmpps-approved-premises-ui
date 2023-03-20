import type { NextFunction, Request, Response } from 'express'

import { DeepMocked, createMock } from '@golevelup/ts-jest'

import TasklistService from '../../services/tasklistService'
import AssessmentsController, { tasklistPageHeading } from './assessmentsController'
import { AssessmentService } from '../../services'

import assessmentFactory from '../../testutils/factories/assessment'

import paths from '../../paths/assess'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import getSections from '../../utils/assessments/getSections'
import { hasRole } from '../../utils/userUtils'
import { GroupedAssessments } from '../../@types/ui'
import { groupAssessmements } from '../../utils/assessments/utils'

jest.mock('../../utils/assessments/utils')
jest.mock('../../utils/userUtils')
jest.mock('../../utils/assessments/informationSetAsNotReceived')
jest.mock('../../services/tasklistService')

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
    it('should list all the assessments when the user is not a workflow manager', async () => {
      const assesments = assessmentFactory.buildList(3)
      const groupedAssessments = {
        completed: [],
        requestedFurtherInformation: [],
        awaiting: [],
      } as GroupedAssessments<'status'>

      assessmentService.getAll.mockResolvedValue(assesments)
      ;(groupAssessmements as jest.Mock).mockReturnValue(groupedAssessments)
      ;(hasRole as jest.Mock).mockReturnValue(false)

      const requestHandler = assessmentsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/index', {
        pageHeading: 'Approved Premises applications',
        assessments: groupedAssessments,
      })
      expect(groupAssessmements).toHaveBeenCalledWith(assesments, 'status')
      expect(assessmentService.getAll).toHaveBeenCalled()
    })

    describe('when the user is a workflow manager', () => {
      const user = { id: 'some-id ' }
      const assesments = assessmentFactory.buildList(3)

      beforeEach(() => {
        ;(hasRole as jest.Mock).mockReturnValue(true)
        response = createMock<Response>({ locals: { user } })
      })

      it('should list all the assessments for a given user when `myAssessments` is set', async () => {
        const groupedAssessments = {
          completed: [],
          requestedFurtherInformation: [],
          awaiting: [],
        } as GroupedAssessments<'status'>

        assessmentService.getAllForUser.mockResolvedValue(assesments)
        ;(groupAssessmements as jest.Mock).mockReturnValue(groupedAssessments)

        const requestHandler = assessmentsController.index()
        request.query = { type: 'myAssessments' }

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('assessments/index', {
          pageHeading: 'Approved Premises applications',
          assessments: groupedAssessments,
          type: 'myAssessments',
        })
        expect(groupAssessmements).toHaveBeenCalledWith(assesments, 'status')
        expect(assessmentService.getAllForUser).toHaveBeenCalledWith(token, user.id)
      })

      it('should list all allocated and unallocated assessments when `user` is not set', async () => {
        const groupedAssessments = {
          allocated: [],
          unallocated: [],
        } as GroupedAssessments<'allocation'>

        assessmentService.getAll.mockResolvedValue(assesments)
        ;(groupAssessmements as jest.Mock).mockReturnValue(groupedAssessments)

        const requestHandler = assessmentsController.index()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('assessments/index', {
          pageHeading: 'Approved Premises applications',
          assessments: groupedAssessments,
        })
        expect(groupAssessmements).toHaveBeenCalledWith(assesments, 'allocation')
        expect(assessmentService.getAll).toHaveBeenCalledWith(token)
      })
    })
  })

  describe('show', () => {
    const assessment = assessmentFactory.build()
    const stubTaskList = jest.fn()

    beforeEach(() => {
      request.params.id = assessment.id

      assessmentService.findAssessment.mockResolvedValue(assessment)
      ;(TasklistService as jest.Mock).mockImplementation(() => {
        return stubTaskList
      })
    })

    it('fetches the assessment and renders the task list', async () => {
      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        taskList: stubTaskList,
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
        taskList: stubTaskList,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })
  })

  describe('submit', () => {
    const assessment = assessmentFactory.build()

    beforeEach(() => {
      request.params.id = assessment.id

      assessmentService.findAssessment.mockResolvedValue(assessment)
    })

    describe('if the "confirmation" input isnt "confirmed"', () => {
      it('renders the "show" view with errors', async () => {
        request.params.id = 'some-id'
        request.body.confirmation = 'some-id'

        const requestHandler = assessmentsController.submit()

        await requestHandler(request, response, next)

        expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, request)
        expect(response.render).toHaveBeenCalledWith('assessments/show', {
          assessment,
          errorObject: {
            text: 'You must confirm the information provided is complete, accurate and up to date.',
          },
          errorSummary: [
            {
              href: '#confirmation',
              text: 'You must confirm the information provided is complete, accurate and up to date.',
            },
          ],
          pageHeading: tasklistPageHeading,
          sections: getSections(assessment),
        })
      })
    })

    describe('if the "confirmation" input is "confirmed"', () => {
      it('renders the success view', async () => {
        request.params.id = 'some-id'
        request.body.confirmation = 'confirmed'

        const requestHandler = assessmentsController.submit()

        await requestHandler(request, response, next)

        expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, request)
        expect(response.render).toHaveBeenCalledWith('assessments/confirm', {
          pageHeading: 'Assessment submission confirmed',
          assessment,
        })
      })
    })
  })
})
