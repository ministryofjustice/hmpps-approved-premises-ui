import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { DataServices, ErrorsAndUserInput, FormPages } from '@approved-premises/ui'
import PagesController from './pagesController'
import { AssessmentService } from '../../../services'
import TasklistPage from '../../../form-pages/tasklistPage'
import Assess from '../../../form-pages/assess'
import { getPage } from '../../../utils/assessmentUtils'

import {
  fetchErrorsAndUserInput,
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
} from '../../../utils/validation'
import { UnknownPageError } from '../../../utils/errors'
import paths from '../../../paths/assess'
import { viewPath } from '../../../form-pages/utils'

import clarificationNoteFactory from '../../../testutils/factories/clarificationNote'
import assessmentFactory from '../../../testutils/factories/assessment'

jest.mock('../../../utils/validation')
jest.mock('../../../form-pages/utils')
jest.mock('../../../utils/assessmentUtils')
jest.mock('../../../form-pages/assess', () => {
  return {
    pages: { 'my-task': {} },
  }
})
jest.mock('../../../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})

Assess.pages = {} as FormPages

describe('pagesController', () => {
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})
  const dataServices = createMock<DataServices>({}) as DataServices

  const PageConstructor = jest.fn()
  const page = createMock<TasklistPage>({})

  const assessment = assessmentFactory.build()

  let pagesController: PagesController

  describe('show', () => {
    const request: DeepMocked<Request> = createMock<Request>({ url: 'assessments' })

    beforeEach(() => {
      ;(viewPath as jest.Mock).mockReturnValue('assessments/pages/some/view')
      ;(getPage as jest.Mock).mockReturnValue(PageConstructor)
      assessmentService.findAssessment.mockResolvedValue(assessment)
      assessmentService.initializePage.mockResolvedValue(page)
      pagesController = new PagesController(assessmentService, dataServices)
    })

    it('renders a page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)

      expect(getPage).toHaveBeenCalledWith('some-task', 'some-page')
      expect(assessmentService.initializePage).toHaveBeenCalledWith(PageConstructor, assessment, request, {}, {})
      expect(response.render).toHaveBeenCalledWith('assessments/pages/some/view', {
        assessmentId: request.params.id,
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

      expect(assessmentService.initializePage).toHaveBeenCalledWith(
        PageConstructor,
        assessment,
        request,
        errorsAndUserInput.userInput,
        {},
      )
      expect(response.render).toHaveBeenCalledWith('assessments/pages/some/view', {
        assessmentId: request.params.id,
        task: 'some-task',
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', async () => {
      assessmentService.initializePage.mockImplementation(() => {
        throw new UnknownPageError('some-page')
      })
      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)
      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()
      assessmentService.initializePage.mockImplementation(() => {
        throw genericError
      })
      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)
      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
    })
  })

  describe('update', () => {
    const request = createMock<Request>({ url: 'assessments', params: { id: 'some-uuid' } })

    beforeEach(() => {
      ;(getPage as jest.Mock).mockReturnValue(PageConstructor)
      assessmentService.initializePage.mockResolvedValue(page)
    })

    it('updates an assessment and redirects to the next page', async () => {
      page.next.mockReturnValue('next-page')

      assessmentService.save.mockResolvedValue()

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(assessmentService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'next-page' }),
      )
    })

    it('redirects to the tasklist if there is no next page', async () => {
      page.next.mockReturnValue(undefined)

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(assessmentService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.show({ id: request.params.id }))
    })

    it('sets a flash and redirects if there are errors', async () => {
      const err = new Error()
      assessmentService.save.mockImplementation(() => {
        throw err
      })

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(assessmentService.save).toHaveBeenCalledWith(page, request)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
      )
    })
  })

  describe('updateSufficientInformation', () => {
    const note = clarificationNoteFactory.build()
    const updateHandler = jest.fn()

    let updateSpy: jest.SpyInstance

    beforeEach(() => {
      jest.resetAllMocks()
      assessmentService.createClarificationNote.mockResolvedValue(note)
      updateSpy = jest.spyOn(pagesController, 'update').mockReturnValue(updateHandler)
    })

    afterEach(() => {
      updateSpy.mockRestore()
    })

    it('creates a note and redirects if sufficientInformation is no and there is a query provided', async () => {
      const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')
      const request = createMock<Request>({
        params: { id: 'some-uuid' },
        body: {
          sufficientInformation: 'no',
          query: 'some text',
        },
      })

      await requestHandler(request, response)

      expect(assessmentService.createClarificationNote).toHaveBeenCalledWith(request.user.token, request.params.id, {
        query: request.body.query,
      })

      expect(response.redirect).toHaveBeenCalledWith(
        paths.assessments.clarificationNotes.confirm({ id: request.params.id }),
      )

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('forwards to the update action if sufficientInformation is yes', async () => {
      const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')

      const request = createMock<Request>({
        params: { id: 'some-uuid' },
        body: {
          sufficientInformation: 'yes',
        },
      })

      const res = createMock<Response>()

      await requestHandler(request, res)

      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()

      expect(updateSpy).toHaveBeenCalledWith('some-task', 'page-name')
      expect(updateHandler).toHaveBeenCalledWith(request, res)
    })

    it('forwards to the update action if sufficientInformation is no but the query is blank', async () => {
      const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')

      const request = createMock<Request>({
        params: { id: 'some-uuid' },
        body: {
          sufficientInformation: 'no',
        },
      })

      const res = createMock<Response>()

      await requestHandler(request, res)

      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()

      expect(updateSpy).toHaveBeenCalledWith('some-task', 'page-name')
      expect(updateHandler).toHaveBeenCalledWith(request, res)
    })
  })
})
