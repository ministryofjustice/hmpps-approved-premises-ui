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
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({ userInput: { startDate: '2025-01-01' } })
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId

      const requestHandler = reportsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/reports/new', {
        pageHeading: 'Reports',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'
    const validBody = {
      startDate: '1/3/2025',
      endDate: '31/5/2025',
      reportType: 'lostBeds',
    }

    beforeEach(() => {
      request.params.id = applicationId
    })

    it('calls the service method', async () => {
      request.body = validBody

      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(reportService.getReport).toHaveBeenCalledWith(token, '2025-03-01', '2025-05-31', 'lostBeds', response)
    })

    it.each([
      ['report type is empty', { reportType: undefined }, { reportType: 'You must choose a report type' }],
      [
        'start and end dates are empty',
        { startDate: undefined, endDate: undefined },
        {
          startDate: 'Enter or select a start date',
          endDate: 'Enter or select an end date',
        },
      ],
      [
        'start and end dates are not invalid',
        { startDate: '31/2/2025', endDate: 'not even a date' },
        {
          startDate: 'Enter a real start date',
          endDate: 'Enter a real end date',
        },
      ],
      [
        'the end date is before the start date',
        { endDate: '31/01/1999' },
        { endDate: 'The end date must be after the start date' },
      ],
      [
        'the end date is more than a year after the start date',
        { endDate: '02/03/2026' },
        { endDate: 'The end date must be less than a year after the start date' },
      ],
    ])('redirects with errors if %s', async (_, body, errors) => {
      request.body = {
        ...validBody,
        ...body,
      }

      const requestHandler = reportsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.admin.reports.new({}),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(errors)
    })
  })
})
