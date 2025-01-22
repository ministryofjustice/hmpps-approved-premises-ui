import { Request, Response, TypedRequestHandler } from 'express'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import { occupancySummary, placementDates, validateSpaceBooking } from '../../../utils/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { type Calendar, occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
  dayAvailabilitySummaryListItems,
  durationSelectOptions,
  occupancyCriteriaMap,
} from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { OccupancySummary } from '../../../utils/match/occupancySummary'
import paths from '../../../paths/match'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'

interface ViewRequest extends Request {
  params: {
    id: string
    premisesId: string
  }
}

interface ViewDayRequest extends Request {
  params: {
    id: string
    premisesId: string
    date: string
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly spaceService: SpaceService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params

      const searchState = this.spaceService.getSpaceSearchState(id, req.session)

      if (!searchState) {
        return res.redirect(paths.v2Match.placementRequests.search.spaces({ id }))
      }

      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const formValues = {
        ...searchState,
        ...userInput,
      }
      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      let summary: OccupancySummary
      let calendar: Calendar

      if (!errors.startDate) {
        const capacityDates = placementDates(searchState.startDate, searchState.durationDays)
        const capacity = await this.premisesService.getCapacity(
          token,
          premisesId,
          capacityDates.startDate,
          capacityDates.endDate,
        )
        const placeholderDetailsUrl = paths.v2Match.placementRequests.search.dayOccupancy({
          id,
          premisesId,
          date: ':date',
        })

        summary = occupancySummary(capacity.capacity, searchState.roomCriteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, searchState.roomCriteria)
      }

      return res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest,
        premises,
        ...formValues,
        ...DateFormats.isoDateToDateInputs(formValues.startDate, 'startDate'),
        ...userInput,
        durationOptions: durationSelectOptions(formValues.durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, formValues.roomCriteria),
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        summary,
        calendar,
        errors,
        errorSummary,
      })
    }
  }

  filterView(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { id, premisesId } = req.params
      const occupancyUrl = paths.v2Match.placementRequests.search.occupancy({ id, premisesId })

      try {
        const { roomCriteria = [], durationDays, ...startDateInput } = req.body

        if (dateIsBlank(startDateInput, 'startDate') || !dateAndTimeInputsAreValidDates(startDateInput, 'startDate')) {
          throw new ValidationError({
            startDate: 'Enter a valid date',
          })
        }

        const { startDate } = DateFormats.dateAndTimeInputsToIsoString(
          startDateInput as ObjectWithDateParts<'startDate'>,
          'startDate',
        )

        this.spaceService.setSpaceSearchState(id, req.session, {
          roomCriteria,
          startDate,
          durationDays: Number(durationDays),
        })

        return res.redirect(occupancyUrl)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, occupancyUrl)
      }
    }
  }

  bookSpace(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { id, premisesId } = req.params
      const { body } = req

      try {
        const errors = validateSpaceBooking(body)

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
          body as ObjectWithDateParts<'arrivalDate'>,
          'arrivalDate',
        )
        const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
          body as ObjectWithDateParts<'departureDate'>,
          'departureDate',
        )

        this.spaceService.setSpaceSearchState(id, req.session, {
          arrivalDate,
          departureDate,
        })

        return res.redirect(paths.v2Match.placementRequests.spaceBookings.new({ id, premisesId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          paths.v2Match.placementRequests.search.occupancy({
            id,
            premisesId,
          }),
        )
      }
    }
  }

  viewDay(): TypedRequestHandler<Request> {
    return async (req: ViewDayRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId, date } = req.params

      const searchState = this.spaceService.getSpaceSearchState(id, req.session)

      if (!searchState) {
        return res.redirect(paths.v2Match.placementRequests.search.spaces({ id }))
      }

      const backlink = paths.v2Match.placementRequests.search.occupancy({ id, premisesId })
      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)
      const premisesCapacity = await this.premisesService.getCapacity(token, premisesId, date)
      const dayCapacity = premisesCapacity.capacity[0]
      const status = dayAvailabilityStatus(dayCapacity, searchState.roomCriteria)

      return res.render('match/placementRequests/occupancyView/viewDay', {
        backlink,
        pageHeading: dayAvailabilityStatusMap[status],
        placementRequest,
        premises,
        date,
        status,
        availabilitySummaryListItems: dayAvailabilitySummaryListItems(dayCapacity, searchState.roomCriteria),
      })
    }
  }
}
