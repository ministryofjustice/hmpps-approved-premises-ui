import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService, PremisesService } from '../../../services'
import paths from '../../../paths/admin'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import { placementDates } from '../../../utils/match'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      let { userInput } = errorsAndUserInput
      const { errors, errorSummary, errorTitle } = errorsAndUserInput

      const premises = await this.premisesService.getCas1All(req.user.token)
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      if (!Object.keys(userInput).length) {
        const dates = placementDates(placementRequest.expectedArrival, String(placementRequest.duration))

        userInput = {
          ...DateFormats.isoDateToDateInputs(dates.startDate, 'arrivalDate'),
          ...DateFormats.isoDateToDateInputs(dates.endDate, 'departureDate'),
        }
      }

      res.render('admin/placementRequests/bookings/new', {
        pageHeading: 'Record an Approved Premises (AP) placement',
        placementRequest,
        premises,
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
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.admin.placementRequests.bookings.new({ id: req.params.id }),
        )
      }
    }
  }
}
