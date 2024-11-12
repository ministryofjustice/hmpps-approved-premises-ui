import { type Request, RequestHandler, type Response } from 'express'
import { PlacementService, PremisesService } from '../../../../services'
import { fetchErrorsAndUserInput } from '../../../../utils/validation'

export default class DeparturesController {
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
      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(reason => !reason.parent)

      return res.render('manage/premises/placements/departure/new', {
        placement,
        departureReasons,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }
}
