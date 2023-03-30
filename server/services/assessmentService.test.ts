import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import { PlacementRequest } from '@approved-premises/api'

import { AssessmentClient } from '../data'
import AssessmentService from './assessmentService'
import { assessmentFactory, clarificationNoteFactory, userFactory } from '../testutils/factories'

import { placementRequestData } from '../utils/assessments/placementRequestData'
import { getBody, updateAssessmentData } from '../form-pages/utils'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { DataServices, TaskListErrors } from '../@types/ui'
import { ValidationError } from '../utils/errors'
import { ApplicationOrAssessmentResponse, getResponseForPage, getResponses } from '../utils/applications/utils'
import { applicationAccepted } from '../utils/assessments/decisionUtils'

jest.mock('../data/assessmentClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../form-pages/utils')
jest.mock('../utils/applications/utils')
jest.mock('../utils/assessments/placementRequestData')
jest.mock('../utils/assessments/decisionUtils')

describe('AssessmentService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>

  const assessmentClientFactory = jest.fn()

  const service = new AssessmentService(assessmentClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    assessmentClientFactory.mockReturnValue(assessmentClient)
  })

  describe('getting all assessments', () => {
    const user = userFactory.build({ id: 'some-uuid' })
    const otherUser = userFactory.build({ id: 'some-other-uuid' })

    const assessmentsForUser = assessmentFactory.buildList(2, {
      allocatedToStaffMember: user,
    })
    const assessmentsForDifferentUser = assessmentFactory.buildList(2, {
      status: 'completed',
      allocatedToStaffMember: otherUser,
    })
    const unallocatedAssessments = assessmentFactory.buildList(2, {
      allocatedToStaffMember: null,
    })

    beforeEach(() => {
      assessmentClient.all.mockResolvedValue(
        [assessmentsForUser, assessmentsForDifferentUser, unallocatedAssessments].flat(),
      )
    })

    describe('getAll', () => {
      it('should return all assessments', async () => {
        const result = await service.getAll('token')

        expect(result).toEqual([assessmentsForUser, assessmentsForDifferentUser, unallocatedAssessments].flat())
      })
    })

    describe('getAllForUser', () => {
      it('should return all assessments for that user', async () => {
        const result = await service.getAllForUser('token', user.id)
        expect(result).toEqual(assessmentsForUser)
      })
    })
  })

  it('finds an assessment by its ID', async () => {
    const assessment = assessmentFactory.build()

    assessmentClient.find.mockResolvedValue(assessment)

    const result = await service.findAssessment('token', assessment.id)

    expect(result).toEqual(assessment)

    expect(assessmentClient.find).toHaveBeenCalledWith(assessment.id)
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const assessment = assessmentFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: assessment.id, task: 'my-task', page: 'first' },
        session: { previousPage: '' },
        user: { token: 'some-token' },
      })
    })

    it('should return a page', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, assessment, request, {})

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, assessment, '')
    })

    it("should call a page's initialize method if it exists", async () => {
      const dataServices = createMock<DataServices>({}) as DataServices
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const TestPage = { initialize: jest.fn() } as unknown as TasklistPageInterface

      await service.initializePage(TestPage, assessment, request, dataServices)

      expect(TestPage.initialize).toHaveBeenCalledWith(request.body, assessment, request.user.token, dataServices)
    })
  })

  describe('save', () => {
    const assessment = assessmentFactory.build()

    const token = 'some-token'
    const request = createMock<Request>({
      params: { id: assessment.id, task: 'some-task', page: 'some-page' },
      user: { token },
    })

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        ;(updateAssessmentData as jest.Mock).mockReturnValue(assessment)

        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { foo: 'bar' },
        })

        assessmentClient.find.mockResolvedValue(assessment)
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(assessmentClientFactory).toHaveBeenCalledWith(token)
        expect(assessmentClient.update).toHaveBeenCalledWith(assessment)
      })
    })

    describe('When there validation errors', () => {
      it('throws an error if there is a validation error', async () => {
        const errors = createMock<TaskListErrors<TasklistPage>>({ knowOralHearingDate: 'error' })
        const page = createMock<TasklistPage>({
          errors: () => errors,
        })

        expect.assertions(1)
        try {
          await service.save(page, request)
        } catch (e) {
          expect(e).toEqual(new ValidationError(errors))
        }
      })
    })
  })

  describe('submit', () => {
    const token = 'some-token'
    let document = { foo: [{ bar: 'baz' }] } as ApplicationOrAssessmentResponse
    const requirements = createMock<PlacementRequest>()
    const assessment = assessmentFactory.build()

    it('if the assessment is accepted the accept client method is called', async () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(true)
      ;(getResponses as jest.Mock).mockReturnValue(document)
      ;(placementRequestData as jest.Mock).mockReturnValue(requirements)

      await service.submit(token, assessment)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.acceptance).toHaveBeenCalledWith(assessment.id, { document, requirements })
    })

    it('if the assessment is rejected the rejection client method is called with the rejectionRationale', async () => {
      const response = {
        Decision: 'Reject, risk too high (must be approved by an AP Area Manager (APAM)',
      }
      document = {
        ...document,
        'make-a-decision': [response],
      }
      ;(applicationAccepted as jest.Mock).mockReturnValue(false)
      ;(getResponses as jest.Mock).mockReturnValue(document)
      ;(getResponseForPage as jest.Mock).mockReturnValue(response)

      await service.submit(token, assessment)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.rejection).toHaveBeenCalledWith(assessment.id, document, response.Decision)
    })
  })

  describe('createClarificationNote', () => {
    it('calls the client with the expected arguments', async () => {
      const token = 'token'
      const id = 'some-uuid'
      const clarificationNote = clarificationNoteFactory.build()

      assessmentClient.createClarificationNote.mockResolvedValue(clarificationNote)

      const result = await service.createClarificationNote(token, id, clarificationNote)

      expect(result).toEqual(clarificationNote)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.createClarificationNote).toHaveBeenCalledWith(id, clarificationNote)
    })
  })

  describe('updateClarificationNote', () => {
    it('calls the client with the expected arguments', async () => {
      const token = 'token'
      const id = 'some-uuid'
      const clarificationNote = clarificationNoteFactory.build()
      const updatedNote = {
        response: clarificationNote.response,
        responseReceivedOn: clarificationNote.responseReceivedOn,
      }

      assessmentClient.updateClarificationNote.mockResolvedValue(clarificationNote)

      const result = await service.updateClarificationNote(token, id, clarificationNote.id, updatedNote)

      expect(result).toEqual(clarificationNote)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.updateClarificationNote).toHaveBeenCalledWith(id, clarificationNote.id, updatedNote)
    })
  })
})
