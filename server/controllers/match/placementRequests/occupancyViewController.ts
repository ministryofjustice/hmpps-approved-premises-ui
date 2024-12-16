import { Request, Response, TypedRequestHandler } from 'express'
import type { ApType, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  occupancySummary,
  occupancyViewLink,
  occupancyViewSummaryListForMatchingDetails,
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
import { durationSelectOptions, occupancyCriteriaMap } from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { OccupancySummary } from '../../../utils/match/occupancySummary'

interface NewRequest extends Request {
  params: {
    id: string
    premisesId: string
  }
  query: ObjectWithDateParts<'startDate'> & {
    durationDays: string
    apType: ApType
    criteria: Array<Cas1SpaceBookingCharacteristic> | Cas1SpaceBookingCharacteristic
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: NewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params
      const { apType, criteria, ...filterUserInput } = req.query
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      let criteriaAsArray: Array<Cas1SpaceBookingCharacteristic>
      if (criteria) {
        criteriaAsArray = Array.isArray(criteria) ? criteria : [criteria]
      }
      const durationDays = Number(filterUserInput.durationDays) || placementRequest.duration

      let startDate: string
      let dateFieldValues: ObjectWithDateParts<'startDate'>

      if (filterUserInput['startDate-day'] || filterUserInput['startDate-month'] || filterUserInput['startDate-year']) {
        dateFieldValues = filterUserInput

        if (dateAndTimeInputsAreValidDates(filterUserInput, 'startDate')) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(filterUserInput, 'startDate').startDate
        } else {
          const dateError = { startDate: 'Enter a valid date' }
          Object.assign(errors, generateErrorMessages(dateError))
          errorSummary.push(generateErrorSummary(dateError)[0])
        }
      } else {
        startDate = placementRequest.expectedArrival
        dateFieldValues = DateFormats.isoDateToDateInputs(startDate, 'startDate')
      }

      const matchingDetailsSummaryList = occupancyViewSummaryListForMatchingDetails(premises.bedCount, placementRequest)
      let summary: OccupancySummary
      let calendar: Calendar

      if (!Object.keys(errors).length) {
        const capacityDates = placementDates(startDate, durationDays)
        const capacity = await this.premisesService.getCapacity(
          token,
          premisesId,
          capacityDates.startDate,
          capacityDates.endDate,
        )

        summary = occupancySummary(capacity.capacity, criteriaAsArray)
        calendar = occupancyCalendar(capacity.capacity, criteriaAsArray)
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
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, criteriaAsArray),
        matchingDetailsSummaryList,
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
      const errors = validateSpaceBooking(body)
      if (this.hasErrors(errors)) {
        if (errors.arrivalDate) {
          addErrorMessageToFlash(req, errors.arrivalDate, 'arrivalDate')
        }
        if (errors.departureDate) {
          addErrorMessageToFlash(req, errors.departureDate, 'departureDate')
        }
        const { startDate, durationDays, apType } = body
        const redirectUrl = occupancyViewLink({
          placementRequestId: req.params.id,
          premisesId: req.params.premisesId,
          apType,
          startDate,
          durationDays,
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
          premisesName: body.premisesName,
          premisesId: body.premisesId,
          apType: body.apType,
          startDate: arrivalDate,
          durationDays: differenceInDays(
            DateFormats.isoToDateObj(departureDate),
            DateFormats.isoToDateObj(arrivalDate),
          ).toString(),
        })
        res.redirect(redirectUrl)
      }
    }
  }

  hasErrors(errors: Record<string, string>): boolean {
    return errors && Object.keys(errors).length > 0
  }
}
