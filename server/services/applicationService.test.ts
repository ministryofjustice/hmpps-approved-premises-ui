import type { Request } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { TaskListErrors, DataServices } from '@approved-premises/ui'

import type TasklistPage from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'
import { getPage } from '../utils/applicationUtils'
import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'

import Apply from '../form-pages/apply'
import applicationFactory from '../testutils/factories/application'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import documentFactory from '../testutils/factories/document'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})

Apply.pages['my-task'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../utils/applicationUtils')

describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getAllForLoggedInUser', () => {
    it('fetches all applications', async () => {
      const token = 'SOME_TOKEN'

      const applications = applicationFactory.buildList(5)
      applicationClient.all.mockResolvedValue(applications)

      const result = await service.getAllForLoggedInUser(token)

      expect(result).toEqual(applications)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns an application', async () => {
      const application = applicationFactory.build()
      const offence = activeOffenceFactory.build()

      const token = 'SOME_TOKEN'

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
      const token = 'SOME_TOKEN'

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

      const token = 'SOME_TOKEN'

      applicationClient.documents.mockResolvedValue(documents)

      const result = await service.getDocuments(token, application)

      expect(result).toEqual(documents)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.documents).toHaveBeenCalledWith(application)
    })
  })

  describe('getCurrentPage', () => {
    let request: DeepMocked<Request>

    const dataServices = createMock<DataServices>({}) as DataServices
    const application = applicationFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id, task: 'my-task' },
        session: { application, previousPage: '' },
        user: { token: 'some-token' },
      })
      ;(getPage as jest.Mock).mockReturnValue(Page)
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      request.session.application = undefined
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, '')
      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should return the session and a page from a page list', async () => {
      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, '')
    })

    it('should initialize the page with the session and the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      const result = await service.getCurrentPage(request, dataServices, userInput)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(userInput, application, '')
    })

    it('should load from the session if the body and userInput are blank', async () => {
      request.body = {}
      request.session.application.data = { 'my-task': { first: { foo: 'bar' } } }

      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith({ foo: 'bar' }, application, '')
    })

    it("should call a service's initialize method if it exists", async () => {
      const OtherPage = { initialize: jest.fn() }
      ;(getPage as jest.Mock).mockReturnValue(OtherPage)

      await service.getCurrentPage(request, dataServices)

      expect(OtherPage.initialize).toHaveBeenCalledWith(request.body, application, request.user.token, dataServices)
    })

    it("retrieve the 'previousPage' value from the session and call the Page object's constructor with that value", async () => {
      request.session.previousPage = 'previous-page-name'
      await service.getCurrentPage(request, dataServices)

      expect(Page).toHaveBeenCalledWith(request.body, application, 'previous-page-name')
    })
  })

  describe('save', () => {
    const application = applicationFactory.build({ data: null })
    const token = 'some-token'
    const request = createMock<Request>({
      params: { id: application.id, task: 'some-task', page: 'some-page' },
      session: { application },
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
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the session', async () => {
        await service.save(page, request)

        expect(request.session.application).toEqual(application)
        expect(request.session.application.data).toEqual({ 'some-task': { 'some-page': { foo: 'bar' } } })
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(applicationClientFactory).toHaveBeenCalledWith(token)
        expect(applicationClient.update).toHaveBeenCalledWith(application)
      })

      it('updates an in-progress application', async () => {
        application.data = { 'some-task': { 'other-page': { question: 'answer' } } }

        await service.save(page, request)

        expect(request.session.application).toEqual(application)
        expect(request.session.application.data).toEqual({
          'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
        })
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
    const request = createMock<Request>({
      user: { token },
    })
    const application = applicationFactory.build()

    it('saves data to the session', async () => {
      await service.submit(request.user.token, application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.submit).toHaveBeenCalledWith(application)
    })
  })
})
