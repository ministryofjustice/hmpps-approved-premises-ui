import type { Request } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { TaskListErrors, DataServices } from '@approved-premises/ui'

import applicationSummaryFactory from '../testutils/factories/applicationSummary'
import type TasklistPage from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'
import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'

import { pages } from '../form-pages/apply'
import paths from '../paths/apply'
import applicationFactory from '../testutils/factories/application'
import { DateFormats } from '../utils/dateUtils'
import { getPage } from '../utils/applicationUtils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})

pages['my-task'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')
jest.mock('../utils/applicationUtils')

describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getApplications', () => {
    it('calls the all method on the client and returns the data in the correct format for the table in the view', async () => {
      const applicationSummaryA = applicationSummaryFactory.build({
        arrivalDate: new Date(2022, 0, 1).toISOString(),
        person: { name: 'A', crn: '1' },
        currentLocation: 'Location 1',
        daysSinceApplicationRecieved: 1,
        id: 'some-id',
        status: 'In progress',
        tier: { lastUpdated: '', level: 'A1' },
      })
      const applicationSummaryB = applicationSummaryFactory.build({
        arrivalDate: new Date(2022, 1, 1).toISOString(),
        person: { name: 'B', crn: '2' },
        currentLocation: 'Location 2',
        daysSinceApplicationRecieved: 2,
        id: 'some-id',
        status: 'Information Requested',
        tier: { lastUpdated: '', level: 'B1' },
      })

      const applicationSummaries = [applicationSummaryA, applicationSummaryB]
      const token = 'SOME_TOKEN'

      applicationClient.all.mockResolvedValue(applicationSummaries)

      const result = await service.tableRows(token)

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationSummaryA.id })}>${
              applicationSummaryA.person.name
            }</a>`,
          },
          {
            text: applicationSummaryA.person.crn,
          },
          {
            html: `<span class="moj-badge moj-badge--red">${applicationSummaryA.tier.level}</span>`,
          },
          {
            text: DateFormats.isoDateToUIDate(applicationSummaryA.arrivalDate),
          },
          {
            html: `<strong class="govuk-tag govuk-tag--blue">${applicationSummaryA.status}</strong>`,
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationSummaryB.id })}>${
              applicationSummaryB.person.name
            }</a>`,
          },
          {
            text: applicationSummaryB.person.crn,
          },
          {
            html: `<span class="moj-badge moj-badge--purple">${applicationSummaryB.tier.level}</span>`,
          },
          {
            text: DateFormats.isoDateToUIDate(applicationSummaryB.arrivalDate),
          },
          {
            html: `<strong class="govuk-tag govuk-tag--yellow">${applicationSummaryB.status}</strong>`,
          },
        ],
      ])

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns an application', async () => {
      const application = applicationFactory.build()
      const token = 'SOME_TOKEN'

      applicationClient.create.mockResolvedValue(application)

      const result = await service.createApplication(token, application.person.crn)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalledWith(application.person.crn)
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
