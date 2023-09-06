import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { ReportService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import paths from '../../paths/admin'
import ReportsController from './reportsController'
import { ValidationError } from '../../utils/errors'

jest.mock('../../utils/validation')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const reportService = createMock<ReportService>({})

  let reportsController: ReportsController

  beforeEach(() => {
    reportsController = new ReportsController(reportService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const applicationId = 'some-id'
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId

      const requestHandler = reportsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/reports/new', {
        pageHeading: 'Reports',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        userInput: errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'

    beforeEach(() => {
      request.params.id = applicationId
    })

    it('calls the service method', async () => {
      request.body.month = '12'
      request.body.year = '2023'
      request.body.reportType = 'lostBeds'

      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(reportService.getReport).toHaveBeenCalledWith(
        token,
        request.body.month,
        request.body.year,
        'lostBeds',
        response,
      )
    })

    it('redirects with a date error if year and month is blank', async () => {
      request.body.reportType = 'lostBeds'
      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.admin.reports.new({}),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        date: 'You must choose a month and year',
      })
    })

    it('redirects with a reportType error if reportType is blank', async () => {
      request.body.month = '12'
      request.body.year = '2023'

      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.admin.reports.new({}),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        reportType: 'You must choose a report type',
      })
    })

    it('redirects with reportType and date errors if both are blank', async () => {
      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.admin.reports.new({}),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        reportType: 'You must choose a report type',
        date: 'You must choose a month and year',
      })
    })
  })
})
