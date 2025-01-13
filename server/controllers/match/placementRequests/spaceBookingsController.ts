import type { Request, RequestHandler, Response, TypedRequestHandler } from 'express'
import type { Cas1NewSpaceBooking, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { createQueryString } from '../../../utils/utils'
import { occupancyViewLink, spaceBookingConfirmationSummaryListRows } from '../../../utils/match'

interface NewRequest extends Request {
  params: { id: string; premisesId: string }
  query: {
    arrivalDate: string
    departureDate: string
    criteria?: Array<string>
    startDate?: string
    durationDays?: string
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly spaceService: SpaceService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params
      const { arrivalDate, departureDate, criteria: criteriaParams, startDate, durationDays } = req.query
      const criteria = [criteriaParams].flat() as Array<Cas1SpaceBookingCharacteristic>

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const submitLink = `${matchPaths.v2Match.placementRequests.spaceBookings.create(req.params)}?${createQueryString(req.query)}`
      const backLink = occupancyViewLink({
        placementRequestId: id,
        premisesId,
        startDate,
        durationDays,
        spaceCharacteristics: criteria,
      })

      const summaryListRows = spaceBookingConfirmationSummaryListRows(
        placementRequest,
        premises,
        arrivalDate,
        departureDate,
        criteria,
      )

      res.render('match/placementRequests/spaceBookings/new', {
        backLink,
        submitLink,
        placementRequest,
        premises,
        arrivalDate,
        departureDate,
        criteria,
        summaryListRows,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        body: { arrivalDate, departureDate, criteria },
        params: { id, premisesId },
        user: { token },
      } = req

      const newSpaceBooking: Cas1NewSpaceBooking = {
        arrivalDate,
        departureDate,
        premisesId,
        requirements: {
          essentialCharacteristics: criteria ? criteria.split(',') : [],
        },
      }
      try {
        await this.spaceService.createSpaceBooking(token, id, newSpaceBooking)
        req.flash(
          'success',
          'You have now booked a place in this AP for this person. An email will be sent to the AP, to inform them of the booking.',
        )
        return res.redirect(`${paths.admin.cruDashboard.index({})}?status=matched`)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          `${matchPaths.v2Match.placementRequests.spaceBookings.new({
            id,
            premisesId,
          })}?${createQueryString(req.query)}`,
        )
      }
    }
  }
}
