import { Request, Response, TypedRequestHandler } from 'express'
import type { ApType, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  occupancySummary,
  occupancyViewLink,
  placementDates,
  redirectToSpaceBookingsNew,
  validateSpaceBooking,
} from '../../../utils/match'
import {
  addErrorMessageToFlash,
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

  private getFilter(filterUserInput: FilterUserInput): {
    filterDurationDays?: number
    filterStartDate?: string
    filterCriteria?: Array<Cas1SpaceBookingCharacteristic>
    filterError?: string
  } {
    const { criteria, durationDays } = filterUserInput

    const filterDurationDays = durationDays ? Number(durationDays) : undefined
    const filterCriteria = this.criteriaAsArray(criteria)
    let filterStartDate: string
    let filterError: string

    if (filterUserInput.startDate) {
      filterStartDate = filterUserInput.startDate
    } else if (
      filterUserInput['startDate-day'] ||
      filterUserInput['startDate-month'] ||
      filterUserInput['startDate-year']
    ) {
      if (dateAndTimeInputsAreValidDates(filterUserInput, 'startDate')) {
        filterStartDate = DateFormats.dateAndTimeInputsToIsoString(filterUserInput, 'startDate').startDate
      } else {
        filterError = 'Enter a valid date'
      }
    }

    return { filterDurationDays, filterStartDate, filterCriteria, filterError }
  }

  view(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params
      const { apType, ...filterUserInput } = req.query
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      const { filterDurationDays, filterStartDate, filterCriteria, filterError } = this.getFilter(filterUserInput)

      if (filterError) {
        const dateError = { startDate: 'Enter a valid date' }
        Object.assign(errors, generateErrorMessages(dateError))
        errorSummary.push(generateErrorSummary(dateError)[0])
      }

      const startDate = filterStartDate || placementRequest.expectedArrival
      const durationDays = filterDurationDays || placementRequest.duration
      const dateFieldValues = filterError ? filterUserInput : DateFormats.isoDateToDateInputs(startDate, 'startDate')

      let summary: OccupancySummary
      let calendar: Calendar

      if (!errors.startDate) {
        const capacityDates = placementDates(startDate, durationDays)
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

        summary = occupancySummary(capacity.capacity, filterCriteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, filterCriteria)
      }

      res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest,
        premises,
        apType,
        ...dateFieldValues,
        startDate,
        durationDays,
        durationOptions: durationSelectOptions(durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, filterCriteria),
        criteria: filterCriteria,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        summary,
        calendar,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  bookSpace(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { body } = req
      const { criteria: criteriaBody } = body
      const criteria = criteriaBody.split(',')

      const errors = validateSpaceBooking(body)

      if (this.hasErrors(errors)) {
        if (errors.arrivalDate) {
          addErrorMessageToFlash(req, errors.arrivalDate, 'arrivalDate')
        }
        if (errors.departureDate) {
          addErrorMessageToFlash(req, errors.departureDate, 'departureDate')
        }

        const { startDate, durationDays } = req.query
        const redirectUrl = occupancyViewLink({
          placementRequestId: req.params.id,
          premisesId: req.params.premisesId,
          startDate: startDate as string,
          durationDays: durationDays as string,
          spaceCharacteristics: criteria,
        })
        res.redirect(redirectUrl)
      } else {
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
        res.redirect(redirectUrl)
      }
    }
  }

  private hasErrors(errors: Record<string, string>): boolean {
    return errors && Object.keys(errors).length > 0
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
