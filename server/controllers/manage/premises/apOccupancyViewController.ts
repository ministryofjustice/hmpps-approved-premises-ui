import type { Request, RequestHandler, Response } from 'express'

import {
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesDaySummary,
  Cas1SpaceBookingCharacteristic,
} from '@approved-premises/api'
import { PremisesService, SessionService } from '../../../services'

import paths from '../../../paths/manage'
import {
  Calendar,
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  type SortablePlacementColumnField,
  daySummaryRows,
  durationSelectOptions,
  filterOutOfServiceBeds,
  generateDaySummaryText,
  occupancyCalendar,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableCaptions,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { DateFormats, daysToWeeksAndDays, isoDateIsValid } from '../../../utils/dateUtils'
import { placementDates } from '../../../utils/match'
import { generateErrorMessages, generateErrorSummary } from '../../../utils/validation'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'
import config from '../../../config'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'

export default class ApOccupancyViewController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly sessionService: SessionService,
  ) {}

  view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId } = req.params
      const errors: Record<string, string> = {}

      const { durationDays = '84', startDate = DateFormats.dateObjtoUIDate(new Date(), { format: 'datePicker' }) } =
        req.query

      const startDateIso = DateFormats.datepickerInputToIsoString(String(startDate))

      if (!startDate || !isoDateIsValid(startDateIso)) {
        errors.startDate = 'Enter a valid date'
      }

      const premises = await this.premisesService.find(req.user.token, premisesId)
      let calendar: Calendar = []
      let calendarHeading: string

      if (!Object.keys(errors).length) {
        const capacityDates = placementDates(startDateIso, parseInt(String(durationDays), 10) - 1)
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate: capacityDates.startDate,
          endDate: capacityDates.endDate,
        })
        calendar = occupancyCalendar(capacity.capacity, premisesId)
        calendarHeading = `Showing ${DateFormats.formatDuration(daysToWeeksAndDays(String(durationDays)))} from ${DateFormats.isoDateToUIDate(startDateIso, { format: 'short' })}`
      }

      return res.render('manage/premises/occupancy/view', {
        pageHeading: `View spaces in ${premises.name}`,
        premises,
        calendar,
        backLink: paths.premises.show({ premisesId }),
        calendarHeading,
        startDate,
        durationOptions: durationSelectOptions(String(durationDays)),
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }

  dayView(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, date } = req.params
      const { characteristics } = req.query

      const characteristicsArray = makeArrayOfType<Cas1SpaceBookingCharacteristic>(characteristics)

      const {
        sortBy = 'personName',
        sortDirection = 'asc',
        hrefPrefix,
      } = getPaginationDetails<SortablePlacementColumnField>(req, paths.premises.occupancy.day({ premisesId, date }), {
        characteristics: characteristicsArray,
      })

      const getDayLink = (targetDate: string) =>
        `${paths.premises.occupancy.day({
          premisesId,
          date: targetDate,
        })}${createQueryString(req.query, { indices: false, addQueryPrefix: true })}`

      const promises = [
        this.premisesService.find(token, premisesId),
        this.premisesService.getDaySummary({
          token,
          premisesId,
          date,
          bookingsSortBy: sortBy,
          bookingsSortDirection: sortDirection,
          bookingsCriteriaFilter: characteristicsArray,
        }),
        this.premisesService.getCapacity(token, premisesId, {
          startDate: date,
        }),
      ]

      const [premises, rawDaySummary, premisesCapacity] = (await Promise.all(promises)) as [
        Cas1Premises,
        Cas1PremisesDaySummary,
        Cas1PremiseCapacity,
      ]

      const daySummary = filterOutOfServiceBeds(
        rawDaySummary,
        config.flags.pocEnabled ? characteristicsArray : undefined,
      )

      const dayCapacity = premisesCapacity.capacity[0]

      return res.render('manage/premises/occupancy/dayView', {
        premises,
        pageHeading: DateFormats.isoDateToUIDate(daySummary.forDate),
        backLink: this.sessionService.getPageBackLink(paths.premises.placements.show.pattern, req, [
          paths.premises.occupancy.view.pattern,
        ]),
        previousDayLink: getDayLink(daySummary.previousDate),
        nextDayLink: getDayLink(daySummary.nextDate),
        daySummaryRows: daySummaryRows(dayCapacity, null, config.flags.pocEnabled ? 'singleRow' : 'none'),
        daySummaryText: generateDaySummaryText(dayCapacity),
        ...tableCaptions(daySummary, characteristicsArray, config.flags.pocEnabled),
        placementTableHeader: tableHeader<PlacementColumnField>(placementColumnMap, sortBy, sortDirection, hrefPrefix),
        placementTableRows: placementTableRows(premisesId, daySummary.spaceBookingSummaries),
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, daySummary.outOfServiceBeds),
        criteriaOptions: config.flags.pocEnabled
          ? null
          : convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, characteristicsArray),
      })
    }
  }
}
