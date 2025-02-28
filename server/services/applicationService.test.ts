import type { Request } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { DataServices, PaginatedResponse, TaskListErrors } from '@approved-premises/ui'
import type {
  ApplicationStatus,
  ApprovedPremisesApplicationSummary,
  SubmitApprovedPremisesApplication,
  UpdateApprovedPremisesApplication,
  WithdrawalReason,
} from '@approved-premises/api'

import { updateFormArtifactData } from '../form-pages/utils/updateFormArtifactData'
import type TasklistPage from '../form-pages/tasklistPage'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'
import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'
import { getBody } from '../form-pages/utils'

import Apply from '../form-pages/apply'
import {
  activeOffenceFactory,
  applicationFactory,
  applicationSummaryFactory,
  assessmentFactory,
  documentFactory,
  noteFactory,
  paginatedResponseFactory,
  requestForPlacementFactory,
  withdrawableFactory,
} from '../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'
import withdrawablesFactory from '../testutils/factories/withdrawablesFactory'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {} },
  }
})

Apply.pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../utils/applications/utils')
jest.mock('../form-pages/utils/updateFormArtifactData')
jest.mock('../form-pages/utils')
jest.mock('../utils/applications/getApplicationData')

describe('ApplicationService', () => {
  const token = 'some-token'
  const applicationId = 'some-uuid'
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getAllForLoggedInUser', () => {
    const applications: Record<ApplicationStatus, Array<ApprovedPremisesApplicationSummary>> = {
      inProgress: applicationSummaryFactory.buildList(1, { status: 'started' }),
      requestedFurtherInformation: applicationSummaryFactory.buildList(1, { status: 'requestedFurtherInformation' }),
      submitted: applicationSummaryFactory.buildList(1, { status: 'submitted' }),
      pending: applicationSummaryFactory.buildList(1, { status: 'assesmentInProgress' }),
      rejected: applicationSummaryFactory.buildList(1, { status: 'rejected' }),
      awaitingPlacement: applicationSummaryFactory.buildList(1, { status: 'awaitingPlacement' }),
      placed: applicationSummaryFactory.buildList(1, { status: 'placementAllocated' }),
      inapplicable: applicationSummaryFactory.buildList(1, { status: 'inapplicable' }),
      withdrawn: applicationSummaryFactory.buildList(1, { status: 'withdrawn' }),
    }

    it('fetches all applications', async () => {
      applicationClient.all.mockResolvedValue(Object.values(applications).flat())

      const result = await service.getAllForLoggedInUser(token)

      expect(result).toEqual({
        inProgress: applications.inProgress,
        requestedFurtherInformation: applications.requestedFurtherInformation,
        submitted: [
          ...applications.submitted,
          ...applications.pending,
          ...applications.rejected,
          ...applications.awaitingPlacement,
          ...applications.placed,
          ...applications.inapplicable,
          ...applications.withdrawn,
        ],
      })

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns an application', async () => {
      const application = applicationFactory.build()
      const offence = activeOffenceFactory.build()

      applicationClient.create.mockResolvedValue(application)

      const result = await service.createApplication(token, application.person.crn, offence)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalledWith(application.person.crn, offence)
    })
  })

  describe('findApplication', () => {
    it('calls the find method and returns an application', async () => {
      const application = applicationFactory.build()

      applicationClient.find.mockResolvedValue(application)

      const result = await service.findApplication(token, application.id)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.find).toHaveBeenCalledWith(application.id)
    })
  })

  describe('getDocuments', () => {
    it('calls the documents method and returns a list of documents', async () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(5)

      applicationClient.documents.mockResolvedValue(documents)

      const result = await service.getDocuments(token, application)

      expect(result).toEqual(documents)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.documents).toHaveBeenCalledWith(application)
    })
  })

  describe('getApplicationFromSessionOrAPI', () => {
    let request: DeepMocked<Request>

    const application = applicationFactory.build()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      request.session.application = undefined
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should fetch the application from the session if it is present', async () => {
      request.session.application = application

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).not.toHaveBeenCalled()
    })

    it('should fetch the application from the API if and application is in the session but it is not the same application as the one being requested', async () => {
      request.session.application = applicationFactory.build()
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const dataServices = createMock<DataServices>({}) as DataServices
    const application = applicationFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      applicationClient.find.mockResolvedValue(application)

      request = createMock<Request>({
        params: { id: application.id, task: 'my-task', page: 'first' },
        user: { token },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application)
      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should return the session and a page from a page list', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application)
    })

    it('should initialize the page with the session and the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      ;(getBody as jest.Mock).mockReturnValue(userInput)

      const result = await service.initializePage(Page, request, dataServices, userInput)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(userInput, application)
    })

    it('should load from the application if the body and userInput are blank', async () => {
      const data = { 'my-task': { first: { foo: 'bar' } } }
      const applicationWithData = {
        ...application,
        data,
      }
      request.body = {}
      applicationClient.find.mockResolvedValue(applicationWithData)
      ;(getBody as jest.Mock).mockReturnValue(data['my-task'].first)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith({ foo: 'bar' }, applicationWithData)
    })

    it("should call a service's initialize method if it exists", async () => {
      const OtherPage = { initialize: jest.fn() } as unknown as TasklistPageInterface
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      await service.initializePage(OtherPage, request, dataServices)

      expect(OtherPage.initialize).toHaveBeenCalledWith(request.body, application, request.user.token, dataServices)
    })
  })

  describe('save', () => {
    const application = applicationFactory.build()
    const applicationData = createMock<UpdateApprovedPremisesApplication>()

    const request = createMock<Request>({
      params: { id: application.id, task: 'some-task', page: 'some-page' },
      user: { token },
    })

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        ;(updateFormArtifactData as jest.Mock).mockReturnValue(application)
        ;(getApplicationUpdateData as jest.Mock).mockReturnValue(applicationData)

        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { foo: 'bar' },
        })

        applicationClient.find.mockResolvedValue(application)
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(applicationClientFactory).toHaveBeenCalledWith(token)
        expect(applicationClient.update).toHaveBeenCalledWith(application.id, applicationData)
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
    const request = createMock<Request>({
      user: { token },
    })
    const application = applicationFactory.build()
    const applicationData = createMock<SubmitApprovedPremisesApplication>()

    it('calls the submit client method', async () => {
      ;(getApplicationSubmissionData as jest.Mock).mockReturnValue(applicationData)
      await service.submit(request.user.token, application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.submit).toHaveBeenCalledWith(application.id, applicationData)

      expect(getApplicationSubmissionData).toHaveBeenCalledWith(application)
    })
  })

  describe('getAssessment', () => {
    const id = 'some-uuid'
    const assessment = assessmentFactory.build()

    it('calls the assessment client method', async () => {
      applicationClient.assessment.mockResolvedValue(assessment)

      const result = await service.getAssessment(token, id)

      expect(result).toEqual(assessment)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.assessment).toHaveBeenCalledWith(id)
    })
  })

  describe('dashboard', () => {
    const applications = applicationSummaryFactory.buildList(5)
    const paginatedResponse = paginatedResponseFactory.build({
      data: applications,
    }) as PaginatedResponse<ApprovedPremisesApplicationSummary>

    beforeEach(() => {
      applicationClient.dashboard.mockResolvedValue(paginatedResponse)
    })

    it('calls the dashboard client method', async () => {
      const result = await service.dashboard(token)

      expect(result).toEqual(paginatedResponse)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.dashboard).toHaveBeenCalledWith(1, 'createdAt', 'asc', {})
    })

    it('passes a page number and sort options', async () => {
      const result = await service.dashboard(token, 2, 'arrivalDate', 'desc', {
        crnOrName: 'foo',
        status: 'assesmentInProgress',
      })

      expect(result).toEqual(paginatedResponse)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.dashboard).toHaveBeenCalledWith(2, 'arrivalDate', 'desc', {
        crnOrName: 'foo',
        status: 'assesmentInProgress',
      })
    })
  })

  describe('withdraw', () => {
    it('calls the client with the ID and token', async () => {
      const id = 'some-uuid'
      const body = {
        reason: 'alternative_identified_placement_no_longer_required' as WithdrawalReason,
        otherReason: 'Some other reason',
      }

      await service.withdraw(token, id, body)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.withdrawal).toHaveBeenCalledWith(id, body)
    })
  })

  describe('timeline', () => {
    it('calls the client with the Id and token', async () => {
      const id = 'some-uuid'

      await service.timeline(token, id)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.timeline).toHaveBeenCalledWith(id)
    })
  })

  describe('getRequestsForPlacement', () => {
    it('calls the client with the id and the token and returns the result', async () => {
      const id = 'some-uuid'
      const requestForPlacements = requestForPlacementFactory.buildList(1)

      applicationClient.requestsForPlacement.mockResolvedValue(requestForPlacements)

      const result = await service.getRequestsForPlacement(token, id)

      expect(result).toEqual(requestForPlacements)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.requestsForPlacement).toHaveBeenCalledWith(id)
    })
  })

  describe('addNote', () => {
    it('calls the client with the id, token and note and returns the result', async () => {
      const noteId = 'note-id'
      const newNote = noteFactory.build({ id: undefined })
      const noteWithId = { ...newNote, id: noteId }

      applicationClient.addNote.mockResolvedValue(noteWithId)

      const result = await service.addNote(token, applicationId, newNote)

      expect(result).toEqual(noteWithId)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.addNote).toHaveBeenCalledWith(applicationId, newNote)
    })
  })

  describe('getWithdrawablesWithNotes', () => {
    it('calls the client with the ID and the token and returns the result', async () => {
      const withdrawable = withdrawableFactory.buildList(1)
      const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })
      applicationClient.withdrawablesWithNotes.mockResolvedValue(withdrawables)

      const result = await service.getWithdrawablesWithNotes(token, applicationId)

      expect(result).toEqual(withdrawables)
      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.withdrawablesWithNotes).toHaveBeenCalledWith(applicationId)
    })
  })
})
