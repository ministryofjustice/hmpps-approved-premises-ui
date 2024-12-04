import { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import type { ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  filterOutAPTypes,
  occupancySummary,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
  redirectToSpaceBookingsNew,
  validateSpaceBooking,
} from '../../../utils/match'
import { DateFormats } from '../../../utils/dateUtils'

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
    return async (req: NewRequest, res: Response): Promise<void> => {
      const { startDate, durationDays, premisesName, premisesId, apType } = req.query
      const errors = {}
      await this.renderOccupancyView(req, res, errors, startDate, durationDays, premisesName, premisesId, apType)
    }
  }

  bookSpace(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response): Promise<void> => {
      const { body } = req
      const errors = validateSpaceBooking(body)
      if (this.hasErrors(errors)) {
        const { startDate, durationDays, premisesName, premisesId, apType } = body
        await this.renderOccupancyView(req, res, errors, startDate, durationDays, premisesName, premisesId, apType)
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

  async renderOccupancyView(
    req: Request,
    res: Response,
    errors: Record<string, string>,
    startDate: string,
    durationDays: string,
    premisesName: string,
    premisesId: string,
    apType: string,
  ): Promise<void> {
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
      errors,
    })
  }

  hasErrors(errors: Record<string, string>): boolean {
    return errors && Object.keys(errors).length > 0
  }
}
