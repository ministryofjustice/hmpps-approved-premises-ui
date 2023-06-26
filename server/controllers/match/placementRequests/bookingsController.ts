import type { Request, Response, TypedRequestHandler } from 'express'
import { decodeBedSearchResult, placementDates } from '../../../utils/matchUtils'
import { PlacementRequestService } from '../../../services'
import paths from '../../../paths/match'

interface ConfirmRequest extends Request {
  params: { id: string }
  query: { startDate: string; duration: string; bedSearchResult: string }
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
        placementRequest,
        bedSearchResult,
        dates: placementDates(req.query.startDate, req.query.duration),
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

  bookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const confirmPath = paths.placementRequests.bookingNotMade.create({ id: req.params.id })

      return res.render('match/placementRequests/bookings/unable-to-match', {
        pageHeading: 'Unable to match',
        confirmPath,
      })
    }
  }

  createBookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.placementRequestService.bookingNotMade(req.user.token, req.params.id, { notes: req.body.notes })
      req.flash('success', 'Placement request marked unable to match')

      return res.redirect(`${paths.placementRequests.index({})}#unable-to-match`)
    }
  }
}
