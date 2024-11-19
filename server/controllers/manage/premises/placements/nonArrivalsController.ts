import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NonArrival, NonArrivalReason } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'

export default class NonArrivalsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)
      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const nonArrivalReasons: Array<NonArrivalReason> = await this.placementService.getNonArrivalReasons(token)
      return res.render('manage/premises/placements/non-arrival', {
        nonArrivalReasons,
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
      const errors: Record<string, string> = {}
      try {
        const { reason, notes } = req.body

        if (!reason) {
          errors.reason = 'You must select a reason for non-arrival'
        }

        if (notes?.length > 200) {
          errors.notes = 'You have exceeded 200 characters'
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const nonArrival: Cas1NonArrival = {
          reason,
          notes,
        }

        await this.placementService.recordNonArrival(req.user.token, premisesId, placementId, nonArrival)

        req.flash('success', 'You have recorded this person as not arrived')
        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.nonArrival({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
