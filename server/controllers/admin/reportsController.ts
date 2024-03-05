import type { Request, Response, TypedRequestHandler } from 'express'

import { ReportService } from '../../services'
import { ValidationError } from '../../utils/errors'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/admin'

export default class ReportsController {
  constructor(private readonly reportsService: ReportService) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('admin/reports/new', {
        pageHeading: 'Reports',
        errors,
        errorSummary,
        userInput,
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      try {
        const { month, year, reportType } = req.body

        if ((!month || !year) && !reportType) {
          throw new ValidationError({
            date: 'You must choose a month and year',
            reportType: 'You must choose a report type',
          })
        }

        if (!month || !year) {
          throw new ValidationError({
            date: 'You must choose a month and year',
          })
        }

        if (!reportType) {
          throw new ValidationError({
            reportType: 'You must choose a report type',
          })
        }

        return await this.reportsService.getReport(req.user.token, month, year, reportType, res)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error as Error, paths.admin.reports.new({}))
      }
    }
  }
}
