import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewArrival } from '@approved-premises/api'
import { PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import PlacementService from '../../../../services/placementService'
import paths from '../../../../paths/manage'
import { DateFormats } from '../../../../utils/dateUtils'

export default class ArrivalsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

      return res.render('manage/placements/arrivals/new', {
        placement,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')

      const placementArrival: Cas1NewArrival = {
        expectedDepartureDate: req.body.expectedDepartureDate,
        arrivalDateTime: `${arrivalDate}T${req.body.arrivalTime}:00.000Z`,
      }

      try {
        await this.placementService.createArrival(req.user.token, premisesId, placementId, placementArrival)

        req.flash('success', 'You have recorded this person as arrived')
        return res.redirect(paths.premises.placements.show({ premisesId, bookingId: placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.arrival({
            premisesId,
            bookingId: placementId,
          }),
        )
      }
    }
  }
}
