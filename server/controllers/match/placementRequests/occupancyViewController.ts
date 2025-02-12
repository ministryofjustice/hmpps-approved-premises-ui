import { Request, Response, TypedRequestHandler } from 'express'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import type { Cas1SpaceBookingCharacteristic, Cas1SpaceBookingDaySummarySortField } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SessionService, SpaceSearchService } from '../../../services'
import { occupancySummary, placementDates, validateSpaceBooking } from '../../../utils/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { type Calendar, occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, daysToWeeksAndDays } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
  durationSelectOptions,
  occupancyCriteriaMap,
} from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { OccupancySummary } from '../../../utils/match/occupancySummary'
import paths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'
import { createQueryString, makeArrayOfType, pluralize } from '../../../utils/utils'
import { filterRoomLevelCriteria } from '../../../utils/match/spaceSearch'
import {
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  daySummaryRows,
  generateCharacteristicsSummary,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { addDays } from 'date-fns'

export type CriteriaQuery = Array<Cas1SpaceBookingCharacteristic> | Cas1SpaceBookingCharacteristic

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
  query: {
    criteria?: CriteriaQuery
    excludeSpaceBookingId?: string
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly spaceSearchService: SpaceSearchService,
    private readonly sessionService: SessionService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params

      const searchState = this.spaceSearchService.getSpaceSearchState(id, req.session)

      if (!searchState) {
        return res.redirect(paths.v2Match.placementRequests.search.spaces({ id }))
      }

      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      searchState.arrivalDate = searchState.arrivalDate || searchState.startDate
      searchState.departureDate =
        searchState.departureDate ||
        DateFormats.dateObjToIsoDate(addDays(DateFormats.isoToDateObj(searchState.startDate), searchState.durationDays))
      const arrivalDateInput = searchState.arrivalDate
        ? DateFormats.isoDateToDateInputs(searchState.arrivalDate, 'arrivalDate')
        : {}
      const departureDateInput = searchState.departureDate
        ? DateFormats.isoDateToDateInputs(searchState.departureDate, 'departureDate')
        : {}

      const formValues = {
        ...searchState,
        ...arrivalDateInput,
        ...departureDateInput,
        ...userInput,
      }

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      let summary: OccupancySummary
      let calendar: Calendar
      const capacityDates = placementDates(searchState.startDate, searchState.durationDays)
      if (!errors.startDate) {
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate: searchState.arrivalDate,
          endDate: searchState.departureDate,
        })
        const placeholderDetailsUrl = `${paths.v2Match.placementRequests.search.dayOccupancy({
          id,
          premisesId,
          date: ':date',
        })}${createQueryString(
          { criteria: searchState.roomCriteria },
          {
            arrayFormat: 'repeat',
            addQueryPrefix: true,
          },
        )}`

        summary = occupancySummary(capacity.capacity, searchState.roomCriteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, searchState.roomCriteria)
      }
      const duration = DateFormats.formatDuration(
        daysToWeeksAndDays(
          DateFormats.differenceInDays(
            DateFormats.isoToDateObj(searchState.departureDate),
            DateFormats.isoToDateObj(searchState.arrivalDate),
          ).number,
        ),
        ['weeks', 'days'],
      )

      return res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `Book placement in ${premises.name}`,
        placementRequest,
        premises,
        ...formValues,
        ...DateFormats.isoDateToDateInputs(capacityDates.startDate, 'startDate'),
        ...DateFormats.isoDateToDateInputs(capacityDates.endDate, 'endDate'),
        ...userInput,
        durationSummary: { rows: [{ key: { text: 'Duration' }, value: { text: duration } }] },
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
      const ARRIVAL = 'arrivalDate'
      const DEPARTURE = 'departureDate'
      try {
        const { roomCriteria = [], ...dateInputs } = req.body

        const errors = validateSpaceBooking(dateInputs)
        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
          dateInputs as ObjectWithDateParts<'arrivalDate'>,
          ARRIVAL,
        )
        const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
          dateInputs as ObjectWithDateParts<'departureDate'>,
          DEPARTURE,
        )

        this.spaceSearchService.setSpaceSearchState(id, req.session, {
          roomCriteria,
          arrivalDate,
          departureDate,
        })

        return req.session.save(() => {
          res.redirect(occupancyUrl)
        })
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
        // const errors = validateSpaceBooking(body)
        //
        // if (Object.keys(errors).length) {
        //   throw new ValidationError(errors)
        // }

        // TODO Validation of arrival and departure dates
        const { arrivalDate, departureDate } = body

        this.spaceSearchService.setSpaceSearchState(id, req.session, {
          arrivalDate,
          departureDate,
        })

        return req.session.save(() => {
          res.redirect(paths.v2Match.placementRequests.spaceBookings.new({ id, premisesId }))
        })
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
      const { criteria = [], excludeSpaceBookingId } = req.query

      const backLink = this.sessionService.getPageBackLink(
        paths.v2Match.placementRequests.search.dayOccupancy.pattern,
        req,
        [paths.v2Match.placementRequests.search.occupancy.pattern, managePaths.premises.placements.changes.new.pattern],
      )

      const filteredCriteria = filterRoomLevelCriteria(makeArrayOfType(criteria))

      const {
        sortBy = 'personName',
        sortDirection = 'asc',
        hrefPrefix,
      } = getPaginationDetails<Cas1SpaceBookingDaySummarySortField>(
        req,
        paths.v2Match.placementRequests.search.dayOccupancy({ id, premisesId, date }),
      )
      const getDayLink = (targetDate: string) =>
        `${paths.v2Match.placementRequests.search.dayOccupancy({ id, premisesId, date: targetDate })}${createQueryString(req.query, { indices: false, addQueryPrefix: true })}`

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)
      const daySummary = await this.premisesService.getDaySummary({
        token,
        premisesId,
        date,
        bookingsSortBy: sortBy,
        bookingsSortDirection: sortDirection,
        bookingsCriteriaFilter: filteredCriteria,
      })
      const premisesCapacity = await this.premisesService.getCapacity(token, premisesId, {
        startDate: date,
        excludeSpaceBookingId,
      })

      const dayCapacity = premisesCapacity.capacity[0]
      const status = dayAvailabilityStatus(dayCapacity, filteredCriteria)
      const formattedDate = DateFormats.isoDateToUIDate(date)

      return res.render('manage/premises/occupancy/dayView', {
        backLink,
        pageHeading: DateFormats.isoDateToUIDate(date),
        dayAvailabilityStatus: dayAvailabilityStatusMap[status],
        daySummaryRows: daySummaryRows(daySummary, filteredCriteria, 'doubleRow'),
        placementRequest,
        premises,
        previousDayLink: getDayLink(daySummary.previousDate),
        nextDayLink: getDayLink(daySummary.nextDate),
        placementTableCaption: `${pluralize('resident', daySummary.spaceBookings?.length)} on ${formattedDate}${generateCharacteristicsSummary(filteredCriteria)}`,
        placementTableHeader: tableHeader<PlacementColumnField>(placementColumnMap, sortBy, sortDirection, hrefPrefix),
        placementTableRows: placementTableRows(premisesId, daySummary.spaceBookings),
        outOfServiceBedCaption: `${pluralize('out of service bed', daySummary.outOfServiceBeds?.length)} on ${formattedDate}`,
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, daySummary.outOfServiceBeds),
      })
    }
  }
}
