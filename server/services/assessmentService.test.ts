import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import { AssessmentAcceptance, Cas1AssessmentSummary, Cas1UpdatedClarificationNote } from '@approved-premises/api'

import { fromPartial } from '@total-typescript/shoehorn'
import { AssessmentClient } from '../data'
import AssessmentService from './assessmentService'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  clarificationNoteFactory,
  paginatedResponseFactory,
} from '../testutils/factories'

import { acceptanceData, placementRequestData } from '../utils/assessments/acceptanceData'
import { getBody } from '../form-pages/utils'
import { updateFormArtifactData } from '../form-pages/utils/updateFormArtifactData'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { DataServices, PaginatedResponse, TaskListErrors } from '../@types/ui'
import { ValidationError } from '../utils/errors'
import { ApplicationOrAssessmentResponse } from '../utils/applications/utils'
import { applicationAccepted } from '../utils/assessments/decisionUtils'
import { getResponses } from '../utils/applications/getResponses'
import { getResponseForPage } from '../utils/applications/getResponseForPage'

jest.mock('../data/assessmentClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../form-pages/utils/updateFormArtifactData')
jest.mock('../form-pages/utils')
jest.mock('../utils/applications/utils')
jest.mock('../utils/applications/getResponses')
jest.mock('../utils/applications/getResponseForPage')
jest.mock('../utils/assessments/acceptanceData')
jest.mock('../utils/assessments/decisionUtils')

describe('AssessmentService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>

  const assessmentClientFactory = jest.fn()

  const service = new AssessmentService(assessmentClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    assessmentClientFactory.mockReturnValue(assessmentClient)
  })

  describe('getAll', () => {
    it('should return all assessments', async () => {
      const assessments = assessmentSummaryFactory.buildList(5)
      const paginatedResponse = paginatedResponseFactory.build({
        data: assessments,
      }) as PaginatedResponse<Cas1AssessmentSummary>

      assessmentClient.all.mockResolvedValue(paginatedResponse)
      const result = await service.getAll('token', ['awaiting_response'], 'name', 'desc', 1)

      expect(result).toEqual({
        data: assessments,
        pageNumber: '1',
        pageSize: '10',
        totalPages: '10',
        totalResults: '100',
      })
      expect(assessmentClient.all).toHaveBeenCalledWith(['awaiting_response'], 1, 'name', 'desc')
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
        user: { token: 'some-token' },
      })
    })

    it('should return a page', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, assessment, request, fromPartial({}))

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, assessment)
    })

    it("should call a page's initialize method if it exists", async () => {
      const dataServices = createMock<DataServices>({}) as DataServices
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const TestPage = { initialize: jest.fn() } as unknown as TasklistPageInterface

      await service.initializePage(TestPage, assessment, request, dataServices)

      expect(TestPage.initialize).toHaveBeenCalledWith(
        request.body,
        assessment,
        (request.user as { token: string }).token,
        dataServices,
      )
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
        ;(updateFormArtifactData as jest.Mock).mockReturnValue(assessment)

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
        } catch (error) {
          expect(error).toEqual(new ValidationError(errors))
        }
      })
    })
  })

  describe('submit', () => {
    const token = 'some-token'
    let document = { foo: [{ bar: 'baz' }] } as ApplicationOrAssessmentResponse
    const assessmentAcceptance = createMock<AssessmentAcceptance>()
    const assessment = assessmentFactory.build()

    it('if the assessment is accepted the accept client method is called', async () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(true)
      ;(acceptanceData as jest.Mock).mockReturnValue(assessmentAcceptance)

      await service.submit(token, assessment)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.acceptance).toHaveBeenCalledWith(assessment.id, assessmentAcceptance)
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
      expect(placementRequestData).not.toHaveBeenCalled()
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
      const updatedNote: Cas1UpdatedClarificationNote = {
        response: clarificationNote.response || '',
        responseReceivedOn: clarificationNote.responseReceivedOn || '',
      }

      assessmentClient.updateClarificationNote.mockResolvedValue(clarificationNote)

      const result = await service.updateClarificationNote(token, id, clarificationNote.id, updatedNote)

      expect(result).toEqual(clarificationNote)

      expect(assessmentClientFactory).toHaveBeenCalledWith(token)
      expect(assessmentClient.updateClarificationNote).toHaveBeenCalledWith(id, clarificationNote.id, updatedNote)
    })
  })
})
