import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { type ErrorsAndUserInput, JourneyType, TaskNames } from '@approved-premises/ui'
import createError from 'http-errors'
import * as getPage from '../../../../../form-pages/utils/getPage'
import PageController from './pageController'
import { FormDataService, PlacementService } from '../../../../../services'
import TasklistPage from '../../../../../form-pages/tasklistPage'
import * as formUtils from '../../../../../form-pages/utils'
import * as validationUtils from '../../../../../utils/validation'
import { UnknownPageError, ValidationError } from '../../../../../utils/errors'
import { catchAPIErrorOrPropogate, catchValidationErrorOrPropogate } from '../../../../../utils/validation'
import { userFactory } from '../../../../../testutils/factories'
import * as backlinks from '../../../../../utils/backlinks'

const placementService = createMock<PlacementService>({})
const formDataService = createMock<FormDataService>({})
jest.mock('../../../../../utils/validation')

let request: Request
let response: Response
let page: DeepMocked<TasklistPage>

describe('resident task page controller', () => {
  const body = { some_field: 'some value' }
  const updatedBody = { some_field: 'updated value' }
  const token = 'token'

  const next: DeepMocked<NextFunction> = jest.fn()

  const taskName = 'task-name' as TaskNames
  const pageName = 'page-name'
  const journeyName = 'journey-name' as JourneyType
  const pageErrors = { 'some-field': 'some-error' }
  const referer = 'https://referer'

  const pageController = new PageController(placementService, formDataService)

  beforeEach(() => {
    jest.resetAllMocks()

    request = createMock<Request>({
      params: { crn: '123456', placementId: 'placement-id' },
      body,
      user: { token },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
        multiPageFormData: {},
        user: userFactory.build({ permissions: [] }),
      },
      headers: { referer },
    })
    response = createMock<Response>({})

    page = createMock<TasklistPage>({ name: pageName })
    const PageConstructor = jest.fn().mockReturnValue(page)
    page.previous.mockReturnValue('')
    page.next.mockReturnValue('next-page')
    page.errors.mockReturnValue({})
    jest.spyOn(getPage, 'getPage').mockImplementation(() => {
      return PageConstructor
    })
    jest.spyOn(formUtils, 'viewPath').mockReturnValue('some/path')
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockImplementation(() => {
      return { errors: {}, errorSummary: [], userInput: {} }
    })
    formDataService.getFormData.mockResolvedValue({ [taskName]: { [pageName]: body } })
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-12'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('show', () => {
    it('should render a page', async () => {
      await pageController.show(taskName, pageName, journeyName)(request, response, next)

      expect(getPage.getPage).toHaveBeenCalledWith(taskName, pageName, journeyName)
      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/some/path',
        expect.objectContaining({
          backLink: '/manage/resident/123456/placement/placement-id/tasks/journey-name',
          formAction:
            '/manage/resident/123456/placement/placement-id/tasks/journey-name/task-name/page/page-name?_method=PUT',
        }),
      )
    })

    it('shows errors and user input when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)

      await pageController.show(taskName, pageName, journeyName)(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/some/path',
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
        }),
      )
    })

    it('returns a 404 when the page cannot be found', async () => {
      jest.spyOn(getPage, 'getPage').mockImplementation(() => {
        throw new UnknownPageError('some-page')
      })

      await pageController.show(taskName, pageName, journeyName)(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()
      jest.spyOn(getPage, 'getPage').mockImplementation(() => {
        throw genericError
      })
      await pageController.show(taskName, pageName, journeyName)(request, response, next)

      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
    })

    it('should remap the links if this is a profile edit', async () => {
      const riskTask = 'risk-information'
      jest.spyOn(backlinks, 'getPageBackLink').mockReturnValue('back-link')
      formDataService.getFormData.mockResolvedValue({ 'pre-arrival': { [pageName]: body } })

      await pageController.show(riskTask, pageName, journeyName)(request, response, next)

      expect(getPage.getPage).toHaveBeenCalledWith(riskTask, pageName, 'pre-arrival')
      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/some/path',
        expect.objectContaining({
          backLink: 'back-link',
          formAction:
            '/manage/resident/123456/placement/placement-id/tasks/journey-name/risk-information/page/page-name?_method=PUT',
        }),
      )
      expect(backlinks.getPageBackLink).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id-task',
        request,
        ['/manage/resident/:crn/placement/:placementId/risk/placementRisks'],
        '/manage/resident/123456/placement/placement-id',
      )
    })
  })

  describe('update', () => {
    it('should handle an update and redirect to the next page', async () => {
      page.body = updatedBody

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(formDataService.updateFormData).toHaveBeenCalledWith('token', 'placement-id', 'journey-name', {
        'task-name': { lastUpdated: '2026-05-12T01:00:00+01:00', 'page-name': updatedBody },
      })
      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name/task-name/page/next-page',
      )
    })

    it('sets a flash and redirects if there are page errors', async () => {
      page.errors.mockReturnValue(pageErrors)

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(formDataService.updateFormData).not.toHaveBeenCalled()
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError(pageErrors),
        '/manage/resident/123456/placement/placement-id/tasks/journey-name/task-name/page/page-name',
      )
    })

    it('sets a flash and redirects if there are save errors', async () => {
      const error = new Error('some-message')
      page.body = updatedBody
      formDataService.getFormData.mockResolvedValue({ [taskName]: { [pageName]: body } })
      formDataService.updateFormData.mockImplementation(() => {
        throw error
      })
      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        '/manage/resident/123456/placement/placement-id/tasks/journey-name/task-name/page/page-name',
      )
    })

    it('should not save if the data are unchanged', async () => {
      page.body = body
      formDataService.getFormData.mockResolvedValue({ [taskName]: { [pageName]: body } })
      formDataService.updateFormData.mockReset()

      await pageController.update(taskName, pageName, journeyName)(request, response)
      expect(formDataService.updateFormData).not.toHaveBeenCalled()
    })

    it('should return to the tasklist if this is the last page', async () => {
      page.next.mockReturnValue('')
      page.errors.mockReturnValue({})

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name',
      )
    })

    it('should return to the tasklist and skip validation if the user has selected save-and-exit', async () => {
      page.errors.mockReturnValue({})
      request.body = { ...request.body, 'save-and-exit': '' }

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name',
      )
      expect(page.errors).not.toHaveBeenCalled()
    })

    it("should remap the persistence call and links if this is a 'profile' edit", async () => {
      const riskTask = 'risk-information'
      jest.spyOn(backlinks, 'getPageBackLink').mockReturnValue('back-link')
      formDataService.getFormData.mockResolvedValue({ 'risk-information': { [pageName]: body } })
      page.body = updatedBody

      await pageController.update(riskTask, pageName, journeyName)(request, response)

      expect(formDataService.updateFormData).toHaveBeenCalledWith('token', 'placement-id', 'journey-name', {
        'risk-information': { lastUpdated: '2026-05-12T01:00:00+01:00', 'page-name': updatedBody },
      })
      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name/risk-information/page/next-page',
      )
    })
  })
})
