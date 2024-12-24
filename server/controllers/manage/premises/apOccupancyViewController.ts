import type { Request, RequestHandler, Response } from 'express'

import { ObjectWithDateParts } from '@approved-premises/ui'
import { PremisesService } from '../../../services'

import paths from '../../../paths/manage'
import { Calendar, durationSelectOptions, occupancyCalendar } from '../../../utils/premises/occupancy'
import { DateFormats, dateAndTimeInputsAreValidDates, daysToWeeksAndDays } from '../../../utils/dateUtils'
import { placementDates } from '../../../utils/match'
import { fetchErrorsAndUserInput, generateErrorMessages, generateErrorSummary } from '../../../utils/validation'

export default class ApOccupancyViewController {
  constructor(private readonly premisesService: PremisesService) {}

  view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId } = req.params
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)
      let startDate
      if (req.query.durationDays) {
        if (dateAndTimeInputsAreValidDates(req.query as ObjectWithDateParts<'startDate'>, 'startDate')) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(
            req.query as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate
        } else {
          const dateError = { startDate: 'Enter a valid date' }
          Object.assign(errors, generateErrorMessages(dateError))
          errorSummary.push(generateErrorSummary(dateError)[0])
          startDate = DateFormats.dateObjToIsoDate(new Date())
        }
      }
      startDate = startDate || DateFormats.dateObjToIsoDate(new Date())
      const { durationDays = '84', ...startDateParts } = req.query
      const premises = await this.premisesService.find(req.user.token, premisesId)
      let calendar: Calendar = []
      if (!errorSummary.length) {
        const capacityDates = placementDates(String(startDate), String(durationDays))
        const capacity = await this.premisesService.getCapacity(
          token,
          premisesId,
          capacityDates.startDate,
          capacityDates.endDate,
        )
        calendar = occupancyCalendar(capacity.capacity, premisesId)
      }
      const calendarHeading = `Showing ${DateFormats.formatDuration(daysToWeeksAndDays(String(durationDays)))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`
      return res.render('manage/premises/occupancy/view', {
        pageHeading: `View spaces in ${premises.name}`,
        premises,
        calendar,
        backLink: paths.premises.show({ premisesId }),
        calendarHeading,
        ...DateFormats.isoDateToDateInputs(startDate, 'startDate'),
        ...startDateParts,
        selfPath: paths.premises.occupancy.view({ premisesId }),
        durationOptions: durationSelectOptions(String(durationDays)),
        errors,
        errorSummary,
      })
    }
  }
}
