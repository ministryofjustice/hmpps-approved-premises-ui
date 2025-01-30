import { type Request, RequestHandler, type Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { ObjectWithDateParts } from '@approved-premises/ui'
import { addDays, differenceInDays } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import { fetchErrorsAndUserInput, generateErrorMessages, generateErrorSummary } from '../../../../utils/validation'
import { occupancySummary } from '../../../../utils/match'
import { Calendar, occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../../utils/dateUtils'
import { CriteriaQuery } from '../../../match/placementRequests/occupancyViewController'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { durationSelectOptions, occupancyCriteriaMap } from '../../../../utils/match/occupancy'
import { OccupancySummary } from '../../../../utils/match/occupancySummary'
import managePaths from '../../../../paths/manage'
import matchPaths from '../../../../paths/match'
import adminPaths from '../../../../paths/admin'

interface ViewRequest extends Request {
  params: {
    premisesId: string
    placementId: string
  }
  query: ObjectWithDateParts<'startDate'> & {
    durationDays: string
    criteria: CriteriaQuery
  }
  body: ObjectWithDateParts<'arrivalDate'> &
    ObjectWithDateParts<'departureDate'> & {
      criteria: string
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
      const { durationDays: queryDurationDays, criteria: queryCriteria, ...startDateParts } = req.query
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placement = await this.placementService.getPlacement(token, placementId)

      let startDate = placement.expectedArrivalDate
      let endDate = placement.expectedDepartureDate
      let durationDays = differenceInDays(endDate, startDate)
      let criteria: Array<Cas1SpaceBookingCharacteristic> = filterRoomLevelCriteria(
        placement.requirements.essentialCharacteristics,
      )

      if (queryDurationDays) {
        durationDays = Number(queryDurationDays)
        criteria = makeArrayOfType(queryCriteria)

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
        const placeholderDetailsUrl = `${matchPaths.v2Match.placementRequests.search.dayOccupancy({
          id: placement.requestForPlacementId,
          premisesId,
          date: ':date',
        })}${createQueryString(
          {
            criteria,
            excludeSpaceBookingId: placement.id,
          },
          { arrayFormat: 'repeat', addQueryPrefix: true },
        )}`

        summary = occupancySummary(capacity.capacity, criteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, criteria)
      }

      return res.render('manage/premises/placements/changes/new', {
        backlink: adminPaths.admin.placementRequests.show({ id: placement.requestForPlacementId }),
        pageHeading: 'Change placement dates',
        placement,
        startDate,
        ...DateFormats.isoDateToDateInputs(startDate, 'startDate'),
        durationDays,
        criteria,
        placementSummary: placementOverviewSummary(placement),
        durationOptions: durationSelectOptions(durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, criteria),
        summary,
        calendar,
        errors,
        errorSummary,
        ...startDateParts,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: ViewRequest, res: Response) => {
      const { params } = req

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')
      const { criteria } = req.body

      const redirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
        {
          arrivalDate,
          departureDate,
          criteria: criteria.split(','),
        },
        { arrayFormat: 'repeat' },
      )}`

      return res.redirect(redirectUrl)
    }
  }

  confirm(): RequestHandler {
    return async (req: ViewRequest, res: Response) => {
      const { placementId } = req.params

      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      return res.render('manage/premises/placements/changes/confirm', {
        pageHeading: 'Confirm booking changes',
        placement,
      })
    }
  }
}
