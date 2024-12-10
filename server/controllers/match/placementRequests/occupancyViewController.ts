import { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
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
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import { durationSelectOptions } from '../../../utils/match/occupancy'

interface NewRequest extends Request {
  params: { id: string }
  query: ObjectWithDateParts<'startDate'> & {
    durationDays: string
    premisesName: string
    premisesId: string
    apType: ApType
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: NewRequest, res: Response) => {
      const { premisesName, premisesId, apType } = req.query

      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      const startDate =
        DateFormats.dateAndTimeInputsToIsoString(req.query, 'startDate').startDate || placementRequest.expectedArrival
      const durationDays = Number(req.query.durationDays) || placementRequest.duration

      const capacityDates = placementDates(startDate, durationDays)
      const capacity = await this.premisesService.getCapacity(
        req.user.token,
        premisesId,
        capacityDates.startDate,
        capacityDates.endDate,
      )
      const matchingDetailsSummaryList = occupancyViewSummaryListForMatchingDetails(
        capacity.premise.bedCount,
        placementRequest,
      )
      const occupancySummaryHtml = occupancySummary(capacity)
      const calendar = occupancyCalendar(capacity)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest,
        premisesName,
        premisesId,
        apType,
        startDate,
        ...DateFormats.isoDateToDateInputs(startDate, 'startDate'),
        durationDays,
        durationOptions: durationSelectOptions(durationDays),
        matchingDetailsSummaryList,
        occupancySummaryHtml,
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
        const { startDate, durationDays, premisesName, premisesId, apType } = body
        const redirectUrl = occupancyViewLink({
          placementRequestId: req.params.id,
          premisesName,
          premisesId,
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
