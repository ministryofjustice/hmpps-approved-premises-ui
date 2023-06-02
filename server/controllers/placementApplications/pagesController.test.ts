import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { DataServices, ErrorsAndUserInput, FormPages } from '@approved-premises/ui'
import PagesController from './pagesController'
import { PlacementApplicationService } from '../../services'
import TasklistPage from '../../form-pages/tasklistPage'
import PlacementRequest from '../../form-pages/placement-application'
import { getPage } from '../../utils/applications/utils'

import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import { UnknownPageError } from '../../utils/errors'
import paths from '../../paths/placementApplications'
import { viewPath } from '../../form-pages/utils'

jest.mock('../../utils/validation')
jest.mock('../../form-pages/utils')
jest.mock('../../utils/applications/utils')
jest.mock('../../form-pages/placement-application', () => {
  return {
    pages: { 'my-task': {} },
  }
})

PlacementRequest.pages = {} as FormPages

describe('pagesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementApplicationService = createMock<PlacementApplicationService>({})
  const dataServices = createMock<DataServices>({}) as DataServices

  const PageConstructor = jest.fn()
  const page = createMock<TasklistPage>({})

  let pagesController: PagesController

  beforeEach(() => {
    pagesController = new PagesController(placementApplicationService)
    placementApplicationService.initializePage.mockResolvedValue(page)
    ;(getPage as jest.Mock).mockReturnValue(PageConstructor)
  })

  describe('show', () => {
    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
      }
      ;(viewPath as jest.Mock).mockReturnValue('placement-application/pages/some/view')
    })

    it('renders a page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(getPage).toHaveBeenCalledWith('some-task', 'some-page', 'placement-applications')
      expect(placementApplicationService.initializePage).toHaveBeenCalledWith(
        PageConstructor,
        request,
        dataServices,
        {},
      )

      expect(response.render).toHaveBeenCalledWith('placement-application/pages/some/view', {
        placementApplicationId: request.params.id,
        task: 'some-task',
        page,
        errors: {},
        errorSummary: [],
        ...page.body,
      })
    })

    it('shows errors and user input when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(placementApplicationService.initializePage).toHaveBeenCalledWith(
        PageConstructor,
        request,
        dataServices,
        errorsAndUserInput.userInput,
      )

      expect(response.render).toHaveBeenCalledWith('placement-application/pages/some/view', {
        placementApplicationId: request.params.id,
        task: 'some-task',
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', async () => {
      placementApplicationService.initializePage.mockImplementation(() => {
        throw new UnknownPageError('some-page')
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()

      placementApplicationService.initializePage.mockImplementation(() => {
        throw genericError
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
      }

      placementApplicationService.initializePage.mockResolvedValue(page)
    })

    it('updates an placement request and redirects to the next page', async () => {
      page.next.mockReturnValue('next-page')

      placementApplicationService.save.mockResolvedValue()

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler({ ...request }, response)

      expect(placementApplicationService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.placementApplications.pages.show({ id: request.params.id, task: 'some-task', page: 'next-page' }),
      )
    })

    it('sets a flash and redirects if there are errors', async () => {
      const err = new Error()
      placementApplicationService.save.mockImplementation(() => {
        throw err
      })

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(placementApplicationService.save).toHaveBeenCalledWith(page, request)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.placementApplications.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
      )
    })
  })
})
