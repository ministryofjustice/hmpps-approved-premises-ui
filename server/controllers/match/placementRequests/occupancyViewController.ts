import { Request, Response, TypedRequestHandler } from 'express'
import type { ApType, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import {
  occupancySummary,
  occupancyViewLink,
  placementDates,
  redirectToSpaceBookingsNew,
  validateSpaceBooking,
} from '../../../utils/match'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateErrorMessages,
  generateErrorSummary,
} from '../../../utils/validation'
import { type Calendar, occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'
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

type CriteriaQuery = Array<Cas1SpaceBookingCharacteristic> | Cas1SpaceBookingCharacteristic

type FilterUserInput = ObjectWithDateParts<'startDate'> & {
  durationDays: string
  criteria: CriteriaQuery
}

interface ViewRequest extends Request {
  params: {
    id: string
    premisesId: string
  }
  query: FilterUserInput & {
    apType: ApType
  }
}

interface ViewDayRequest extends Request {
  params: {
    id: string
    premisesId: string
    date: string
  }
  query: {
    criteria: CriteriaQuery
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly spaceService: SpaceService,
  ) {}

  private criteriaAsArray(
    criteria?: Cas1SpaceBookingCharacteristic | Array<Cas1SpaceBookingCharacteristic>,
  ): Array<Cas1SpaceBookingCharacteristic> {
    let filterCriteria: Array<Cas1SpaceBookingCharacteristic>
    if (criteria) {
      filterCriteria = Array.isArray(criteria) ? criteria : [criteria]
    }
    return filterCriteria
  }

  view(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params

      const searchState = this.spaceService.getSpaceSearchState(req.params.id, req.session)

      if (!searchState) {
        return res.redirect(paths.v2Match.placementRequests.search.spaces({ id: req.params.id }))
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

  bookSpace(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { body } = req
      const { criteria: criteriaBody } = body
      const criteria = criteriaBody?.split(',')

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
        const redirectUrl = redirectToSpaceBookingsNew({
          placementRequestId: req.params.id,
          premisesId: req.params.premisesId,
          ...req.query,
          arrivalDate,
          departureDate,
          criteria,
        })
        return res.redirect(redirectUrl)
      } catch (error) {
        const { startDate, durationDays, criteria: criteriaQuery } = req.query
        const redirectUrl = occupancyViewLink({
          placementRequestId: req.params.id,
          premisesId: req.params.premisesId,
          startDate: startDate as string,
          durationDays: durationDays as string,
          spaceCharacteristics: criteria || criteriaQuery,
        })
        return catchValidationErrorOrPropogate(req, res, error, redirectUrl)
      }
    }
  }

  viewDay(): TypedRequestHandler<Request> {
    return async (req: ViewDayRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId, date } = req.params
      const { criteria } = req.query

      const backlink = req.headers.referer
      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)
      const premisesCapacity = await this.premisesService.getCapacity(token, premisesId, date)
      const dayCapacity = premisesCapacity.capacity[0]
      const status = dayAvailabilityStatus(dayCapacity, this.criteriaAsArray(criteria))

      res.render('match/placementRequests/occupancyView/viewDay', {
        backlink,
        pageHeading: dayAvailabilityStatusMap[status],
        placementRequest,
        premises,
        date,
        status,
        availabilitySummaryListItems: dayAvailabilitySummaryListItems(dayCapacity, this.criteriaAsArray(criteria)),
      })
    }
  }
}
