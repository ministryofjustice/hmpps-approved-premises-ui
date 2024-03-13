import type { NextFunction, Request, Response } from 'express'

import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApprovedPremisesAssessmentSummary as AssessmentSummary, Task } from '@approved-premises/api'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import TasklistService from '../../services/tasklistService'
import AssessmentsController from './assessmentsController'
import { AssessmentService, TaskService } from '../../services'

import {
  assessmentFactory,
  assessmentSummaryFactory,
  paginatedResponseFactory,
  taskFactory,
} from '../../testutils/factories'

import paths from '../../paths/assess'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import { ErrorsAndUserInput, PaginatedResponse } from '../../@types/ui'
import { awaitingAssessmentStatuses } from '../../utils/assessments/utils'
import { getPaginationDetails } from '../../utils/getPaginationDetails'

jest.mock('../../utils/assessments/utils')
jest.mock('../../utils/users')
jest.mock('../../utils/validation')
jest.mock('../../utils/assessments/informationSetAsNotReceived')
jest.mock('../../services/tasklistService')
jest.mock('../../utils/getPaginationDetails')

describe('assessmentsController', () => {
  const token = 'SOME_TOKEN'
  const userId = 'SOME_ID'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})
  const taskService = createMock<TaskService>({})

  let assessmentsController: AssessmentsController

  beforeEach(() => {
    assessmentsController = new AssessmentsController(assessmentService, taskService)
    response = createMock<Response>({ locals: { user: { id: userId } } })
    request = createMock<Request>({ user: { token } })
  })

  describe('index', () => {
    const assessments = assessmentSummaryFactory.buildList(3)
    const paginationDetails = {
      hrefPrefix: paths.assessments.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }
    ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
    const paginatedResponse = paginatedResponseFactory.build({
      data: assessments,
    }) as PaginatedResponse<AssessmentSummary>

    beforeEach(() => {
      assessmentService.getAll.mockResolvedValue(paginatedResponse)
    })

    it('should list all the assessments with awaiting_assessment statuses by default', async () => {
      const requestHandler = assessmentsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/index', {
        pageHeading: 'Approved Premises applications',
        assessments,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        placementApplications: undefined,
      })
      expect(assessmentService.getAll).toHaveBeenCalledWith(
        token,
        awaitingAssessmentStatuses,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
        1,
      )
    })

    it.each(['awaiting_assessment', 'completed', 'awaiting_response'])(
      'should list all the assessments with %s statuses',
      async status => {
        request.query.activeTab = status
        const requestHandler = assessmentsController.index()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('assessments/index', {
          pageHeading: 'Approved Premises applications',
          assessments,
          activeTab: status,
          pageNumber: Number(paginatedResponse.pageNumber),
          totalPages: Number(paginatedResponse.totalPages),
          hrefPrefix: paginationDetails.hrefPrefix,
          sortBy: paginationDetails.sortBy,
          sortDirection: paginationDetails.sortDirection,
          placementApplications: undefined,
        })
        expect(assessmentService.getAll).toHaveBeenCalledWith(
          token,
          awaitingAssessmentStatuses,
          paginationDetails.sortBy,
          paginationDetails.sortDirection,
          1,
        )
      },
    )

    describe('if the activeTab is requests_for_placement', () => {
      it('should list all the request_for_placement tasks', async () => {
        const placementApplications = taskFactory.buildList(3, { taskType: 'PlacementApplication' })
        const paginatedTaskResponse = paginatedResponseFactory.build({
          data: placementApplications,
        }) as PaginatedResponse<Task>

        taskService.getAll.mockResolvedValue(paginatedTaskResponse)
        const activeTab = 'requests_for_placement'
        const requestHandler = assessmentsController.index()

        await requestHandler(
          {
            ...request,
            query: {
              activeTab,
            },
          },
          response,
          next,
        )

        expect(response.render).toHaveBeenCalledWith('assessments/index', {
          activeTab,
          hrefPrefix: paginationDetails.hrefPrefix,
          pageHeading: 'Approved Premises applications',
          pageNumber: Number(paginatedResponse.pageNumber),
          totalPages: Number(paginatedResponse.totalPages),
          sortBy: paginationDetails.sortBy,
          placementApplications,
          sortDirection: paginationDetails.sortDirection,
        })

        expect(taskService.getAll).toHaveBeenCalledWith({
          token,
          taskTypes: ['PlacementApplication'],
          allocatedFilter: 'allocated',
          allocatedToUserId: userId,
          page: Number(paginatedResponse.pageNumber),
          sortBy: 'name',
          sortDirection: 'desc',
        })
      })
    })
  })

  describe('show', () => {
    const assessment = assessmentFactory.build()
    const stubTaskList = jest.fn()
    const referrer = 'http://localhost/foo/bar'

    beforeEach(() => {
      request.params.id = assessment.id
      request.headers.referer = referrer

      assessmentService.findAssessment.mockResolvedValue(assessment)
      ;(TasklistService as jest.Mock).mockImplementation(() => {
        return stubTaskList
      })
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [] }
      })
    })

    it('fetches the assessment and renders the task list', async () => {
      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/tasklist', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        taskList: stubTaskList,
        errorSummary: [],
        errors: {},
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('fetches the assessment and renders the show page if the assessment is completed', async () => {
      const completedAssessment = { ...assessment, status: 'completed' as const }
      assessmentService.findAssessment.mockResolvedValue(completedAssessment)

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment: completedAssessment,
        referrer,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('redirects if the assessment is in a awaiting response state and informationSetAsNotReceived is false', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)
      assessment.status = 'awaiting_response'

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

    it('fetches the assessment and renders the task list  if the assessment is in an awaiting response state and informationSetAsNotReceived is true', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(true)
      assessment.status = 'awaiting_response'

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/tasklist', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        taskList: stubTaskList,
        errorSummary: [],
        errors: {},
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    describe('when there is an error in the flash', () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      beforeEach(() => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return errorsAndUserInput
        })
      })

      it('sends the errors to the template', async () => {
        const requestHandler = assessmentsController.show()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('assessments/tasklist', {
          assessment,
          pageHeading: 'Assess an Approved Premises (AP) application',
          taskList: stubTaskList,
          errorSummary: errorsAndUserInput.errorSummary,
          errors: errorsAndUserInput.errors,
        })

        expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
      })
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
        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          request,
          'You must confirm the information provided is complete, accurate and up to date.',
          'confirmation',
        )
        expect(response.redirect).toHaveBeenCalledWith(paths.assessments.show({ id: assessment.id }))
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
