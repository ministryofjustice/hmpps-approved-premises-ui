import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewArrival } from '@approved-premises/api'
import { PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import PlacementService from '../../../../services/placementService'
import paths from '../../../../paths/manage'
import { DateFormats, dateAndTimeInputsAreValidDates, timeIsValid24hrFormat } from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'

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

      return res.render('manage/premises/placements/arrival', {
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

      try {
        const errors: Record<string, string> = {}

        const { arrivalTime } = req.body

        if (!arrivalTime) {
          errors.arrivalTime = 'You must enter a time of arrival'
        } else if (!timeIsValid24hrFormat(arrivalTime)) {
          errors.arrivalTime = 'You must enter a valid time of arrival in 24hr format'
        }

        const { arrivalDateTime } = DateFormats.dateAndTimeInputsToIsoString(
          {
            ...req.body,
            'arrivalDateTime-time': arrivalTime,
          },
          'arrivalDateTime',
        )

        if (!arrivalDateTime) {
          errors.arrivalDateTime = 'You must enter an arrival date'
        } else if (!dateAndTimeInputsAreValidDates(req.body, 'arrivalDateTime')) {
          errors.arrivalDateTime = 'You must enter a valid arrival date'
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const placementArrival: Cas1NewArrival = {
          arrivalDateTime,
        }

        await this.placementService.createArrival(req.user.token, premisesId, placementId, placementArrival)

        req.flash('success', 'You have recorded this person as arrived')
        return res.redirect(paths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.arrival({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
