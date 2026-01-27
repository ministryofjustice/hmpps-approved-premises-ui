import { Request, Response, TypedRequestHandler } from 'express'
import type { KeyDetailsArgs, ObjectWithDateParts } from '@approved-premises/ui'
import type { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { getPageBackLink } from '../../../utils/backlinks'
import { PlacementRequestService, PlacementService, PremisesService } from '../../../services'
import { occupancySummary, placementDates, validateSpaceBooking } from '../../../utils/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { type Calendar, occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { DateFormats, isoDateIsValid } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatusForCriteria,
  dayAvailabilityStatusMap,
  durationSelectOptions,
} from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { OccupancySummary } from '../../../utils/match/occupancySummary'
import paths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import adminPaths from '../../../paths/admin'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'
import { filterRoomLevelCriteria } from '../../../utils/match/spaceSearch'
import {
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  SortablePlacementColumnField,
  daySummaryRows,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableCaptions,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { roomCharacteristicMap, roomCharacteristicsInlineList } from '../../../utils/characteristicsUtils'
import MultiPageFormManager from '../../../utils/multiPageFormManager'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'
import { placementKeyDetails } from '../../../utils/placements'
import { newPlacementSummaryList } from '../../../utils/match/newPlacement'
import { getPlacementOfStatus } from '../../../utils/placementRequests/placements'

export type CriteriaQuery = Array<Cas1SpaceBookingCharacteristic> | Cas1SpaceBookingCharacteristic

interface ViewRequest extends Request {
  params: {
    placementRequestId: string
    premisesId: string
  }
}

interface ViewDayRequest extends Request {
  params: {
    placementRequestId?: string
    placementId?: string
    premisesId: string
    date: string
  }
  query: {
    criteria?: CriteriaQuery
    excludeSpaceBookingId?: string
  }
}

export default class {
  formData: MultiPageFormManager<'spaceSearch'>

  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {
    this.formData = new MultiPageFormManager('spaceSearch')
  }

  view(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { placementRequestId, premisesId } = req.params

      const searchState = this.formData.get(placementRequestId, req.session)

      if (!searchState) {
        return res.redirect(paths.v2Match.placementRequests.search.spaces({ placementRequestId }))
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

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, placementRequestId)
      const { startDate, endDate } = searchState.newPlacementArrivalDate
        ? {
            startDate: DateFormats.datepickerInputToIsoString(searchState.newPlacementArrivalDate),
            endDate: DateFormats.datepickerInputToIsoString(searchState.newPlacementDepartureDate),
          }
        : placementDates(
            placementRequest.authorisedPlacementPeriod.arrival,
            placementRequest.authorisedPlacementPeriod.duration,
          )
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
          placementRequestId,
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
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRequest,
        selectedCriteria: roomCharacteristicsInlineList(searchState.roomCriteria, 'no room criteria'),
        arrivalDateHint: `Requested arrival date: ${DateFormats.isoDateToUIDate(startDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Requested departure date: ${DateFormats.isoDateToUIDate(endDate, { format: 'dateFieldHint' })}`,
        bookingHeading: searchState.newPlacementReason ? 'Book placement transfer' : 'Book placement',
        premises,
        ...formValues,
        startDate: DateFormats.isoDateToUIDate(searchState.startDate, { format: 'datePicker' }),
        startDateIso: searchState.startDate,
        ...userInput,
        durationOptions: durationSelectOptions(formValues.durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, formValues.roomCriteria),
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        newPlacementSummaryList: newPlacementSummaryList(
          searchState,
          getPlacementOfStatus('arrived', placementRequest),
        ),
        summary,
        calendar,
        errors,
        errorSummary,
      })
    }
  }

  filterView(): TypedRequestHandler<Request> {
    return async (req: ViewRequest, res: Response) => {
      const { placementRequestId, premisesId } = req.params
      const occupancyUrl = paths.v2Match.placementRequests.search.occupancy({
        placementRequestId,
        premisesId,
      })

      try {
        const { roomCriteria, durationDays, startDate: startDateRaw } = req.body

        const startDate = DateFormats.datepickerInputToIsoString(String(startDateRaw))

        if (!startDate || !isoDateIsValid(startDate)) {
          throw new ValidationError({
            startDate: 'Enter a valid date',
          })
        }

        await this.formData.update(placementRequestId, req.session, {
          roomCriteria: makeArrayOfType<Cas1SpaceBookingCharacteristic>(roomCriteria) || [],
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
      const { placementRequestId, premisesId } = req.params
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

        await this.formData.update(placementRequestId, req.session, {
          arrivalDate,
          departureDate,
        })

        return res.redirect(paths.v2Match.placementRequests.spaceBookings.new({ placementRequestId, premisesId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          paths.v2Match.placementRequests.search.occupancy({
            placementRequestId,
            premisesId,
          }),
        )
      }
    }
  }

  viewDay(): TypedRequestHandler<Request> {
    return async (req: ViewDayRequest, res: Response) => {
      const { token } = req.user
      const { placementRequestId, premisesId, placementId, date } = req.params
      const { criteria = [] } = req.query

      const backLink = getPageBackLink(paths.v2Match.placementRequests.search.dayOccupancy.pattern, req, [
        paths.v2Match.placementRequests.search.occupancy.pattern,
        managePaths.premises.placements.changes.new.pattern,
        adminPaths.admin.nationalOccupancy.weekView.pattern,
        adminPaths.admin.nationalOccupancy.premisesView.pattern,
      ])

      const filteredCriteria = filterRoomLevelCriteria(makeArrayOfType(criteria))

      const getPathWithDate = (pathDate: string) => {
        if (placementRequestId) {
          return paths.v2Match.placementRequests.search.dayOccupancy({
            placementRequestId,
            premisesId,
            date: pathDate,
          })
        }

        if (placementId) {
          return managePaths.premises.placements.changes.dayOccupancy({ premisesId, placementId, date: pathDate })
        }

        return adminPaths.admin.nationalOccupancy.premisesDayView({ premisesId, date: pathDate })
      }

      const {
        sortBy = 'canonicalArrivalDate',
        sortDirection = 'asc',
        hrefPrefix,
      } = getPaginationDetails<SortablePlacementColumnField>(req, getPathWithDate(date))

      const getDayLink = (targetDate: string) =>
        `${getPathWithDate(targetDate)}${createQueryString(req.query, { arrayFormat: 'repeat', addQueryPrefix: true })}`

      const premises = await this.premisesService.find(token, premisesId)

      const daySummary = await this.premisesService.getDaySummary({
        token,
        premisesId,
        date,
        bookingsSortBy: sortBy,
        bookingsSortDirection: sortDirection,
      })

      const premisesCapacity = await this.premisesService.getCapacity(token, premisesId, {
        startDate: date,
        excludeSpaceBookingId: placementId,
      })
      const dayCapacity = premisesCapacity.capacity[0]
      const status = dayAvailabilityStatusForCriteria(dayCapacity, filteredCriteria)

      let keyDetails: KeyDetailsArgs

      if (placementRequestId) {
        const placementRequest = await this.placementRequestService.getPlacementRequest(token, placementRequestId)
        keyDetails = placementRequestKeyDetails(placementRequest)
      }

      if (placementId) {
        const placement = await this.placementService.getPlacement(token, placementId)
        keyDetails = placementKeyDetails(placement)
      }

      return res.render('manage/premises/occupancy/dayView', {
        backLink,
        pageHeading: DateFormats.isoDateToUIDate(date),
        contextKeyDetails: keyDetails,
        dayAvailabilityStatus: dayAvailabilityStatusMap[status],
        daySummaryRows: daySummaryRows(dayCapacity, filteredCriteria, 'singleRow'),
        premises,
        previousDayLink: getDayLink(daySummary.previousDate),
        nextDayLink: getDayLink(daySummary.nextDate),
        ...tableCaptions(daySummary, [], true),
        placementTableHeader: tableHeader<PlacementColumnField>(placementColumnMap, sortBy, sortDirection, hrefPrefix),
        placementTableRows: placementTableRows(premisesId, daySummary.spaceBookingSummaries, req),
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, daySummary.outOfServiceBeds),
      })
    }
  }
}
