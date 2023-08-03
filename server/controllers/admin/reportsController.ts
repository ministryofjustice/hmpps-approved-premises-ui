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
        const { month, year } = req.body

        if (!month || !year) {
          throw new ValidationError({
            date: 'You must choose a month and year',
          })
        }

        return this.reportsService.getReport(req.user.token, month, year, res)
      } catch (err) {
        return catchValidationErrorOrPropogate(req, res, err, paths.admin.reports.new({}))
      }
    }
  }
}
