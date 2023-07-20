import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService, PremisesService } from '../../../services'
import paths from '../../../paths/admin'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const premises = await this.premisesService.getAll(req.user.token)
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('admin/placementRequests/bookings/new', {
        pageHeading: 'Create a placement',
        premises,
        placementRequest,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const newPlacementRequestBooking = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate'),
      }

      try {
        const booking = await this.placementRequestService.createBooking(
          req.user.token,
          req.params.id,
          newPlacementRequestBooking,
        )

        req.flash('success', `Placement created for ${booking.premisesName}`)
        return res.redirect(paths.admin.placementRequests.show({ id: req.params.id }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.admin.placementRequests.bookings.new({ id: req.params.id }),
        )
      }
    }
  }
}
