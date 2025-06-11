import type { Request, Response, TypedRequestHandler } from 'express'

import { differenceInYears } from 'date-fns'
import { ReportService } from '../../services'
import { ValidationError } from '../../utils/errors'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/admin'
import { DateFormats, dateIsValid } from '../../utils/dateUtils'

export default class ReportsController {
  constructor(private readonly reportsService: ReportService) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('admin/reports/new', {
        pageHeading: 'Reports',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      try {
        const { startDate: startDateSlashes, endDate: endDateSlashes, reportType } = req.body

        const startDate = DateFormats.dateWithSlashesToISODate(startDateSlashes)
        const endDate = DateFormats.dateWithSlashesToISODate(endDateSlashes)

        const errors: Record<keyof Request['body'], string> = {}

        if (!reportType) errors.reportType = 'You must choose a report type'

        if (!startDate) {
          errors.startDate = 'Enter or select a start date'
        } else if (!dateIsValid(startDate)) {
          errors.startDate = 'Enter a real start date'
        }

        if (!endDate) {
          errors.endDate = 'Enter or select an end date'
        } else if (!dateIsValid(endDate)) {
          errors.endDate = 'Enter a real end date'
        } else if (!errors.startDate) {
          if (startDate > endDate) {
            errors.endDate = 'The end date must be after the start date'
          } else if (differenceInYears(endDate, startDate) > 0) {
            errors.endDate = 'The end date must be less than a year after the start date'
          }
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        return await this.reportsService.getReport(req.user.token, startDate, endDate, reportType, res)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error as Error, paths.admin.reports.new({}))
      }
    }
  }
}
