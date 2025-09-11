import { Request } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementApplicationClient from '../data/placementApplicationClient'
import {
  applicationFactory,
  placementApplicationDecisionEnvelopeFactory,
  placementApplicationFactory,
} from '../testutils/factories'
import PlacementApplicationService, { LegacyError } from './placementApplicationService'
import { DataServices, TaskListErrors } from '../@types/ui'
import { getBody } from '../form-pages/utils'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'

import { placementApplicationSubmissionData } from '../utils/placementRequests/placementApplicationSubmissionData'

jest.mock('../data/placementApplicationClient.ts')
jest.mock('../form-pages/utils')
jest.mock('../utils/placementRequests/placementApplicationSubmissionData')

describe('placementApplicationService', () => {
  const placementApplicationClient = new PlacementApplicationClient(null) as jest.Mocked<PlacementApplicationClient>
  const placementApplicationClientFactory = jest.fn()

  const service = new PlacementApplicationService(placementApplicationClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    placementApplicationClientFactory.mockReturnValue(placementApplicationClient)
  })

  describe('createPlacementApplication', () => {
    it('calls the client method and returns the resulting placement request', () => {
      const applicationId = 'some-id'
      const placementApplication = placementApplicationFactory.build()
      placementApplicationClient.create.mockResolvedValue(placementApplication)

      const result = service.create(token, applicationId)

      expect(result).resolves.toEqual(placementApplication)
    })
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const dataServices = createMock<DataServices>({}) as DataServices
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'sentence-type-check': { sentenceTypeCheck: 'no' } } },
    })
    const Page = jest.fn()

    beforeEach(() => {
      placementApplicationClient.find.mockResolvedValue(placementApplication)

      request = createMock<Request>({
        params: { id: placementApplication.id, task: 'my-task', page: 'first' },
        user: { token: 'some-token' },
      })
    })

    it('should fetch the placement application from the API', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, placementApplication)
      expect(placementApplicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should return the session and a page from a page list', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, placementApplication)
    })

    it('should initialize the page with the session and the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      ;(getBody as jest.Mock).mockReturnValue(userInput)

      const result = await service.initializePage(Page, request, dataServices, userInput)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(userInput, placementApplication)
    })

    it('should load from the application if the body and userInput are blank', async () => {
      const data = { 'my-task': { first: { foo: 'bar' } } }
      const applicationWithData = {
        ...placementApplication,
        data: { ...placementApplication.data, ...data },
      }
      request.body = {}
      placementApplicationClient.find.mockResolvedValue(applicationWithData)
      ;(getBody as jest.Mock).mockReturnValue(data['my-task'].first)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith({ foo: 'bar' }, applicationWithData)
    })

    it("should call a service's initialize method if it exists", async () => {
      const OtherPage = { initialize: jest.fn() } as unknown as TasklistPageInterface
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      await service.initializePage(OtherPage, request, dataServices)

      expect(OtherPage.initialize).toHaveBeenCalledWith(
        request.body,
        placementApplication,
        request.user.token,
        dataServices,
      )
    })

    it('should throw a LegacyError if the data are not valid', async () => {
      const legacyApplication = {
        ...placementApplication,
        data: {},
      }

      placementApplicationClient.find.mockResolvedValue(legacyApplication)
      try {
        await service.initializePage(Page, request, dataServices)
      } catch (error) {
        expect(error).toBeInstanceOf(LegacyError)
      }
    })
  })

  describe('save', () => {
    const placementApplication = placementApplicationFactory.build()
    const request = createMock<Request>({
      params: { id: placementApplication.id, task: 'some-task', page: 'some-page' },
      user: { token },
    })

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { foo: 'bar' },
        })

        placementApplicationClient.find.mockResolvedValue(placementApplication)
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(placementApplicationClientFactory).toHaveBeenCalledWith(token)
        expect(placementApplicationClient.update).toHaveBeenCalledWith(placementApplication)
      })
    })

    describe('When there are validation errors', () => {
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
    it('calls the client method and returns the resulting placement application', () => {
      const placementApplication = placementApplicationFactory.build()
      const application = applicationFactory.build()
      ;(placementApplicationSubmissionData as jest.Mock).mockReturnValue({})

      placementApplicationClient.submission.mockResolvedValue(placementApplication)

      const result = service.submit(token, placementApplication, application)

      expect(result).resolves.toEqual(placementApplication)
    })
  })

  describe('submitDecision', () => {
    it('calls the client method and returns the a placement application', () => {
      const decisionEnvelope = placementApplicationDecisionEnvelopeFactory.build()
      const placementApplication = placementApplicationFactory.build()

      placementApplicationClient.decisionSubmission.mockResolvedValue(placementApplication)

      const result = service.submitDecision(token, placementApplication.id, decisionEnvelope)

      expect(result).resolves.toEqual(placementApplication)
    })
  })

  describe('withdraw', () => {
    it('calls the client method and returns the result', async () => {
      const placementApplication = placementApplicationFactory.build()
      const reason = 'AlternativeProvisionIdentified'

      placementApplicationClient.withdraw.mockResolvedValue(placementApplication)

      const result = await service.withdraw(token, placementApplication.id, reason)

      expect(result).toEqual(placementApplication)
    })
  })
})
