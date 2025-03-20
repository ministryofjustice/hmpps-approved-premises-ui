import { Request, Response, TypedRequestHandler } from 'express'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import type { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SessionService, SpaceSearchService } from '../../../services'
import { occupancySummary, placementDates, validateSpaceBooking } from '../../../utils/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { type Calendar, occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../utils/dateUtils'
import { dayAvailabilityStatus, dayAvailabilityStatusMap, durationSelectOptions } from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { OccupancySummary } from '../../../utils/match/occupancySummary'
import paths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'
import { filterRoomLevelCriteria } from '../../../utils/match/spaceSearch'
import {
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  SortablePlacementColumnField,
  daySummaryRows,
  filterOutOfServiceBeds,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableCaptions,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import config from '../../../config'
import { roomCharacteristicMap, roomCharacteristicsInlineList } from '../../../utils/characteristicsUtils'

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
      const { startDate, endDate } = placementDates(placementRequest.expectedArrival, placementRequest.duration)
      const premises = await this.premisesService.find(token, premisesId)

      let summary: OccupancySummary
      let calendar: Calendar

      if (!errors.startDate) {
        const capacityDates = placementDates(searchState.startDate, searchState.durationDays - 1)
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate: capacityDates.startDate,
          endDate: capacityDates.endDate,
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

      return res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest,
        selectedCriteria: roomCharacteristicsInlineList(searchState.roomCriteria, 'no room criteria'),
        arrivalDateHint: `Requested arrival date: ${DateFormats.isoDateToUIDate(startDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Requested departure date: ${DateFormats.isoDateToUIDate(endDate, { format: 'dateFieldHint' })}`,
        premises,
        ...formValues,
        ...DateFormats.isoDateToDateInputs(formValues.startDate, 'startDate'),
        ...userInput,
        durationOptions: durationSelectOptions(formValues.durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, formValues.roomCriteria),
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
        const { roomCriteria, durationDays, ...startDateInput } = req.body

        if (dateIsBlank(startDateInput, 'startDate') || !dateAndTimeInputsAreValidDates(startDateInput, 'startDate')) {
          throw new ValidationError({
            startDate: 'Enter a valid date',
          })
        }

        const { startDate } = DateFormats.dateAndTimeInputsToIsoString(
          startDateInput as ObjectWithDateParts<'startDate'>,
          'startDate',
        )

        this.spaceSearchService.setSpaceSearchState(id, req.session, {
          roomCriteria: makeArrayOfType<Cas1SpaceBookingCharacteristic>(roomCriteria) || [],
          startDate,
          durationDays: Number(durationDays),
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
      } = getPaginationDetails<SortablePlacementColumnField>(
        req,
        paths.v2Match.placementRequests.search.dayOccupancy({ id, premisesId, date }),
      )
      const getDayLink = (targetDate: string) =>
        `${paths.v2Match.placementRequests.search.dayOccupancy({
          id,
          premisesId,
          date: targetDate,
        })}${createQueryString(req.query, { arrayFormat: 'repeat', addQueryPrefix: true })}`

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)
      const daySummary = filterOutOfServiceBeds(
        await this.premisesService.getDaySummary({
          token,
          premisesId,
          date,
          bookingsSortBy: sortBy,
          bookingsSortDirection: sortDirection,
        }),
        config.flags.pocEnabled ? filteredCriteria : undefined,
      )
      const premisesCapacity = await this.premisesService.getCapacity(token, premisesId, {
        startDate: date,
        excludeSpaceBookingId,
      })

      const dayCapacity = premisesCapacity.capacity[0]
      const status = dayAvailabilityStatus(dayCapacity, filteredCriteria)

      return res.render('manage/premises/occupancy/dayView', {
        backLink,
        pageHeading: DateFormats.isoDateToUIDate(date),
        dayAvailabilityStatus: dayAvailabilityStatusMap[status],
        daySummaryRows: daySummaryRows(
          daySummary,
          filteredCriteria,
          config.flags.pocEnabled ? 'singleRow' : 'doubleRow',
        ),
        placementRequest,
        premises,
        previousDayLink: getDayLink(daySummary.previousDate),
        nextDayLink: getDayLink(daySummary.nextDate),
        ...tableCaptions(daySummary, filteredCriteria),
        placementTableHeader: tableHeader<PlacementColumnField>(placementColumnMap, sortBy, sortDirection, hrefPrefix),
        placementTableRows: placementTableRows(premisesId, daySummary.spaceBookings),
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, daySummary.outOfServiceBeds),
      })
    }
  }
}
