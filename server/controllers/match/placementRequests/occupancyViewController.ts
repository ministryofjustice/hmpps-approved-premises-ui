import { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  filterOutAPTypes,
  occupancySummary,
  occupancyViewLink,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
  redirectToSpaceBookingsNew,
  validateSpaceBooking,
} from '../../../utils/match'
import { DateFormats } from '../../../utils/dateUtils'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../../utils/validation'

interface NewRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; premisesName: string; premisesId: string; apType: ApType }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: NewRequest, res: Response) => {
      const { startDate, durationDays, premisesName, premisesId, apType } = req.query
      const dates = placementDates(startDate, durationDays)
      const [placementRequest, capacity] = await Promise.all([
        this.placementRequestService.getPlacementRequest(req.user.token, req.params.id),
        this.premisesService.getCapacity(req.user.token, premisesId, dates.startDate, dates.endDate),
      ])
      const essentialCharacteristics = filterOutAPTypes(placementRequest.essentialCriteria)
      const matchingDetailsSummaryList = occupancyViewSummaryListForMatchingDetails(
        capacity.premise.bedCount,
        dates,
        placementRequest,
        essentialCharacteristics,
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
        durationDays,
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
