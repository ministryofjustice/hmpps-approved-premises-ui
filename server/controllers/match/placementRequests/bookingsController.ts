import type { Request, Response, TypedRequestHandler } from 'express'
import { decodeBedSearchResult, placementDates } from '../../../utils/matchUtils'
import { PlacementRequestService } from '../../../services'

interface ConfirmRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationWeeks: string; bedSearchResult: string }
}

interface CreateRequest extends Request {
  params: { id: string }
  body: { arrivalDate: string; departureDate: string; bedId: string }
}

export default class BookingsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  confirm(): TypedRequestHandler<Request, Response> {
    return async (req: ConfirmRequest, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const bedSearchResult = decodeBedSearchResult(req.query.bedSearchResult)

      res.render('match/placementRequests/bookings/confirm', {
        pageHeading: 'Confirm booking',
        person: placementRequest.person,
        bedSearchResult,
        dates: placementDates(req.query.startDate, req.query.durationWeeks),
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: CreateRequest, res: Response) => {
      const newPlacementRequestBooking = {
        arrivalDate: req.body.arrivalDate,
        departureDate: req.body.departureDate,
        bedId: req.body.bedId,
      }

      const bookingConfirmation = await this.placementRequestService.createBooking(
        req.user.token,
        req.params.id,
        newPlacementRequestBooking,
      )

      res.render('match/placementRequests/bookings/success', {
        pageHeading: 'Your booking is complete',
        bookingConfirmation,
      })
    }
  }
}
