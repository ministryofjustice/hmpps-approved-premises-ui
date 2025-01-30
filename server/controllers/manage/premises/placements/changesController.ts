import { type Request, RequestHandler, type Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { ObjectWithDateParts } from '@approved-premises/ui'
import { addDays, differenceInDays } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import { fetchErrorsAndUserInput, generateErrorMessages, generateErrorSummary } from '../../../../utils/validation'
import { occupancySummary } from '../../../../utils/match'
import paths from '../../../../paths/match'
import { Calendar, occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../../utils/dateUtils'
import { CriteriaQuery } from '../../../match/placementRequests/occupancyViewController'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { durationSelectOptions, occupancyCriteriaMap } from '../../../../utils/match/occupancy'
import { OccupancySummary } from '../../../../utils/match/occupancySummary'

interface ViewRequest extends Request {
  params: {
    premisesId: string
    placementId: string
  }
  query: ObjectWithDateParts<'startDate'> & {
    durationDays: string
    criteria: CriteriaQuery
  }
}

export default class ChangesController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { durationDays: queryDurationDays, criteria, ...startDateParts } = req.query
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placement = await this.placementService.getPlacement(token, placementId)

      let startDate = placement.expectedArrivalDate
      let endDate = placement.expectedDepartureDate
      let durationDays = differenceInDays(endDate, startDate)
      let bookingCriteria: Array<Cas1SpaceBookingCharacteristic> = filterRoomLevelCriteria(
        placement.requirements.essentialCharacteristics,
      )

      if (queryDurationDays) {
        durationDays = Number(queryDurationDays)
        bookingCriteria = makeArrayOfType(criteria)

        if (dateAndTimeInputsAreValidDates(startDateParts, 'startDate')) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(startDateParts, 'startDate').startDate
          endDate = DateFormats.dateObjToIsoDate(addDays(startDate, durationDays))
        } else {
          const startDateError = {
            startDate: 'Enter a valid date',
          }
          errorSummary.push(...generateErrorSummary(startDateError))
          Object.assign(errors, generateErrorMessages(startDateError))
        }
      }

      let summary: OccupancySummary
      let calendar: Calendar

      if (!errors.startDate) {
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate,
          endDate,
          excludeSpaceBookingId: placement.id,
        })
        const placeholderDetailsUrl = `${paths.v2Match.placementRequests.search.dayOccupancy({
          id: placement.requestForPlacementId,
          premisesId,
          date: ':date',
        })}${createQueryString(
          {
            criteria: bookingCriteria,
            excludeSpaceBookingId: placement.id,
          },
          { arrayFormat: 'repeat', addQueryPrefix: true },
        )}`

        summary = occupancySummary(capacity.capacity, bookingCriteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, bookingCriteria)
      }

      return res.render('manage/premises/placements/changes', {
        pageHeading: 'Change placement dates',
        placement,
        startDate,
        ...DateFormats.isoDateToDateInputs(startDate, 'startDate'),
        durationDays,
        placementSummary: placementOverviewSummary(placement),
        durationOptions: durationSelectOptions(durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, bookingCriteria),
        summary,
        calendar,
        errors,
        errorSummary,
        ...startDateParts,
        ...userInput,
      })
    }
  }
}
