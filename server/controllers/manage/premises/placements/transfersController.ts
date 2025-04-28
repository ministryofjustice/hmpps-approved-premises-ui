import type { Request, Response, RequestHandler } from 'express'
import { PlacementService } from '../../../../services'
import { fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'

export default class TransfersController {
  constructor(private readonly placementService: PlacementService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      return res.render('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show({ premisesId, placementId }),
        pageHeading: 'Request a transfer',
        placement,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}
