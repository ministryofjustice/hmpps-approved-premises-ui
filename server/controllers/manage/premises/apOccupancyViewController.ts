import type { Request, RequestHandler, Response } from 'express'

import { ObjectWithDateParts } from '@approved-premises/ui'
import { Cas1SpaceBookingCharacteristic, Cas1SpaceBookingDaySummarySortField } from '@approved-premises/api'
import { PremisesService } from '../../../services'

import paths from '../../../paths/manage'
import {
  Calendar,
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  daySummaryRows,
  durationSelectOptions,
  generateDaySummaryText,
  occupancyCalendar,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { DateFormats, dateAndTimeInputsAreValidDates, daysToWeeksAndDays } from '../../../utils/dateUtils'
import { placementDates } from '../../../utils/match'
import { fetchErrorsAndUserInput, generateErrorMessages, generateErrorSummary } from '../../../utils/validation'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { occupancyCriteriaMap } from '../../../utils/match/occupancy'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'

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

  dayView(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, date } = req.params
      const { characteristics } = req.query

      const characteristicsArray = makeArrayOfType<Cas1SpaceBookingCharacteristic>(characteristics)
      const premises = await this.premisesService.find(token, premisesId)
      const {
        sortBy = 'personName',
        sortDirection = 'asc',
        hrefPrefix,
      } = getPaginationDetails<Cas1SpaceBookingDaySummarySortField>(
        req,
        paths.premises.occupancy.day({ premisesId, date }),
        { characteristics: characteristicsArray },
      )
      const getDayLink = (targetDate: string) =>
        `${paths.premises.occupancy.day({ premisesId, date: targetDate })}${createQueryString(req.query, { indices: false, addQueryPrefix: true })}`

      const daySummary = await this.premisesService.getDaySummary({
        token,
        premisesId,
        date,
        bookingsSortBy: sortBy,
        bookingsSortDirection: sortDirection,
        bookingsCriteriaFilter: characteristicsArray as Array<Cas1SpaceBookingCharacteristic>,
      })
      return res.render('manage/premises/occupancy/dayView', {
        premises,
        pageHeading: DateFormats.isoDateToUIDate(daySummary.forDate),
        backLink: paths.premises.occupancy.view({ premisesId }),
        previousDayLink: getDayLink(daySummary.previousDate),
        nextDayLink: getDayLink(daySummary.nextDate),
        daySummaryRows: daySummaryRows(daySummary),
        daySummaryText: generateDaySummaryText(daySummary),
        formattedDate: DateFormats.isoDateToUIDate(daySummary.forDate),
        placementTableHeader: tableHeader<PlacementColumnField>(placementColumnMap, sortBy, sortDirection, hrefPrefix),
        placementTableRows: placementTableRows(premisesId, daySummary.spaceBookings),
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, daySummary.outOfServiceBeds),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, characteristicsArray),
      })
    }
  }
}
