import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { type ErrorsAndUserInput, JourneyType, TaskNames } from '@approved-premises/ui'
import * as getPage from '../../../../../form-pages/utils/getPage'
import PageController from './pageController'
import { FormDataService, PlacementService } from '../../../../../services'
import TasklistPage from '../../../../../form-pages/tasklistPage'
import * as formUtils from '../../../../../form-pages/utils'
import * as validationUtils from '../../../../../utils/validation'

const placementService = createMock<PlacementService>({})
const formService = createMock<FormDataService>({})
jest.mock('../../../../../utils/validation')

describe('resident task page controller', () => {
  const request: DeepMocked<Request> = createMock<Request>({
    params: { crn: '123456', placementId: 'placement-id' },
    body: { some_field: 'some value' },
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const taskName = 'task-name' as TaskNames
  const pageName = 'page-name'
  const journeyName = 'journey-name' as JourneyType

  const page = createMock<TasklistPage>({ name: pageName })
  const PageConstructor = jest.fn().mockReturnValue(page)
  page.previous.mockReturnValue('')

  const pageController = new PageController(placementService, formService)

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(getPage, 'getPage').mockImplementation(() => {
      return PageConstructor
    })
    jest.spyOn(formUtils, 'viewPath').mockReturnValue('some/path')
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockImplementation(() => {
      return { errors: {}, errorSummary: [], userInput: {} }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
  })

  describe('update', () => {
    it('should handle an update and redirect to the next page', async () => {
      page.next.mockReturnValue('next-page')
      page.errors.mockReturnValue({})

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name/task-name/page/next-page',
      )
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
      page.next.mockReturnValue('next-page')
      page.errors.mockReturnValue({}).mockReset()
      request.body = { ...request.body, 'save-and-exit': '' }

      await pageController.update(taskName, pageName, journeyName)(request, response)

      expect(response.redirect).toHaveBeenCalledWith(
        '/manage/resident/123456/placement/placement-id/tasks/journey-name',
      )
      expect(page.errors).not.toHaveBeenCalled()
    })
  })
})
