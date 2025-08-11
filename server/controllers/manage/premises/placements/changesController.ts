import { type Request, RequestHandler, type Response } from 'express'
import { Cas1SpaceBookingCharacteristic, Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementService, PremisesService, SessionService } from '../../../../services'
import {
  catchValidationErrorOrPropogate,
  errorMessage,
  errorSummary as addErrorSummary,
  fetchErrorsAndUserInput,
} from '../../../../utils/validation'
import {
  occupancySummary,
  placementDates,
  spaceBookingConfirmationSummaryListRows,
  validateSpaceBooking,
} from '../../../../utils/match'
import { Calendar, occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { DateFormats, daysToWeeksAndDays, isoDateIsValid } from '../../../../utils/dateUtils'
import { CriteriaQuery } from '../../../match/placementRequests/occupancyViewController'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { durationSelectOptions, getClosestDuration } from '../../../../utils/match/occupancy'
import { OccupancySummary } from '../../../../utils/match/occupancySummary'
import managePaths from '../../../../paths/manage'
import adminPaths from '../../../../paths/admin'
import { ValidationError } from '../../../../utils/errors'
import { roomCharacteristicMap, roomCharacteristicsInlineList } from '../../../../utils/characteristicsUtils'

type RequestParams = {
  premisesId: string
  placementId: string
}

interface ViewRequest extends Request {
  params: RequestParams
  query: {
    startDate: string
    durationDays: string
    criteria: CriteriaQuery
  }
  body: ObjectWithDateParts<'arrivalDate'> &
    ObjectWithDateParts<'departureDate'> & {
      criteria: string
      actualArrivalDate: string
    }
}

type ConfirmQuery = {
  arrivalDate: string
  departureDate: string
  criteria: CriteriaQuery
}

interface ConfirmRequest extends Request {
  params: RequestParams
  query: ConfirmQuery
}

interface CreateRequest extends Request {
  params: RequestParams
  body: {
    arrivalDate: string
    departureDate: string
    criteria: string
  }
}

export default class ChangesController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
    private readonly sessionService: SessionService,
  ) {}

  new(): RequestHandler {
    return async (req: ViewRequest, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placement = await this.placementService.getPlacement(token, placementId)

      let pageHeading = 'Change placement'
      let startDate = placement.expectedArrivalDate

      if (placement.actualArrivalDate) {
        pageHeading = 'Extend placement'
        startDate = placement.actualArrivalDate
      }

      let startDateRaw = DateFormats.isoDateToUIDate(startDate, { format: 'datePicker' })
      let durationDays = DateFormats.durationBetweenDates(placement.expectedDepartureDate, startDate).number
      let criteria: Array<Cas1SpaceBookingCharacteristic> = filterRoomLevelCriteria(placement.characteristics)

      if (req.query.durationDays) {
        startDateRaw = String(req.query.startDate)
        startDate = DateFormats.datepickerInputToIsoString(startDateRaw)
        durationDays = Number(req.query.durationDays)
        criteria = makeArrayOfType(req.query.criteria)

        if (!startDate || !isoDateIsValid(startDate)) {
          const startDateErrorMessage = 'Enter a valid date'
          errors.startDate = errorMessage('startDate', startDateErrorMessage)
          errorSummary.push(addErrorSummary('startDate', startDateErrorMessage))
        }
      }

      let summary: OccupancySummary
      let calendar: Calendar
      let calendarHeading: string

      if (!errors.startDate) {
        const capacityDates = placementDates(startDate, durationDays - 1)
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate: capacityDates.startDate,
          endDate: capacityDates.endDate,
          excludeSpaceBookingId: placement.id,
        })
        const placeholderDetailsUrl = `${managePaths.premises.placements.changes.dayOccupancy({
          premisesId,
          placementId,
          date: ':date',
        })}${createQueryString({ criteria }, { arrayFormat: 'repeat', addQueryPrefix: true })}`

        summary = occupancySummary(capacity.capacity, criteria)
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, criteria)
        calendarHeading = `Showing ${DateFormats.formatDuration(daysToWeeksAndDays(String(durationDays)))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`
      }

      return res.render('manage/premises/placements/changes/new', {
        backlink: this.sessionService.getPageBackLink(managePaths.premises.placements.changes.new.pattern, req, [
          managePaths.premises.placements.show.pattern,
          adminPaths.admin.placementRequests.show.pattern,
        ]),
        pageHeading,
        placement,
        selectedCriteria: roomCharacteristicsInlineList(criteria, 'no room criteria'),
        arrivalDateHint: `Current arrival date: ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Current departure date: ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
        startDate: startDateRaw,
        durationDays,
        criteria,
        placementSummary: placementOverviewSummary(placement),
        durationOptions: durationSelectOptions(getClosestDuration(durationDays)),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, criteria),
        summary,
        calendar,
        calendarHeading,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: ViewRequest, res: Response) => {
      const { body, params, query } = req

      try {
        const errors = validateSpaceBooking(body)

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
        const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')
        const { criteria } = req.body

        const redirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
          {
            ...query,
            arrivalDate,
            departureDate,
            criteria: criteria.split(','),
          },
          { arrayFormat: 'repeat' },
        )}`

        return res.redirect(redirectUrl)
      } catch (error) {
        const viewUrl = `${managePaths.premises.placements.changes.new(params)}${createQueryString(req.query, {
          arrayFormat: 'repeat',
          addQueryPrefix: true,
        })}`
        return catchValidationErrorOrPropogate(req, res, error, viewUrl)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: ConfirmRequest, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { arrivalDate, departureDate, criteria } = req.query
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const [premises, placement] = await Promise.all([
        this.premisesService.find(token, premisesId),
        this.placementService.getPlacement(token, placementId),
      ])
      const backlink = `${managePaths.premises.placements.changes.new(req.params)}${createQueryString(req.query, {
        arrayFormat: 'repeat',
        addQueryPrefix: true,
      })}`

      return res.render('manage/premises/placements/changes/confirm', {
        pageHeading: 'Confirm booking changes',
        backlink,
        placement,
        summaryListRows: spaceBookingConfirmationSummaryListRows({
          premises,
          actualArrivalDate: placement.actualArrivalDate,
          expectedArrivalDate: arrivalDate || placement.expectedArrivalDate,
          expectedDepartureDate: departureDate,
          criteria: makeArrayOfType<Cas1SpaceBookingCharacteristic>(criteria) || [],
        }),
        arrivalDate,
        departureDate,
        criteria,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: CreateRequest, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { arrivalDate, departureDate, criteria } = req.body

      try {
        const updatePlacementData: Cas1UpdateSpaceBooking = {
          arrivalDate,
          departureDate,
          characteristics: makeArrayOfType<Cas1SpaceBookingCharacteristic>(criteria.split(',')).filter(Boolean),
        }

        await this.placementService.updatePlacement(token, premisesId, placementId, updatePlacementData)

        const placement = await this.placementService.getPlacement(token, placementId)

        req.flash('success', 'Booking changed successfully')

        const redirectUrl = placement.placementRequestId
          ? adminPaths.admin.placementRequests.show({ placementRequestId: placement.placementRequestId })
          : managePaths.premises.placements.show({
              premisesId,
              placementId,
            })

        return res.redirect(redirectUrl)
      } catch (error) {
        const redirectUrl = `${managePaths.premises.placements.changes.confirm({
          premisesId,
          placementId,
        })}${createQueryString(
          {
            arrivalDate,
            departureDate,
            criteria: criteria.split(','),
          },
          { arrayFormat: 'repeat', addQueryPrefix: true },
        )}`
        return catchValidationErrorOrPropogate(req, res, error, redirectUrl)
      }
    }
  }
}
