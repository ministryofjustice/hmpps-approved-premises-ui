import type { Request, RequestHandler, Response } from 'express'

import PremisesService from '../../../services/premisesService'
import paths from '../../../paths/manage'

export default class BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const beds = await this.premisesService.getBeds(req.user.token, req.params.premisesId)

      return res.render('manage/premises/beds/index', {
        beds,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage beds',
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const backLink = paths.premises.beds.index({ premisesId })
      const bed = await this.premisesService.getBed(req.user.token, premisesId, req.params.bedId)
      const premises = await this.premisesService.find(req.user.token, premisesId)

      return res.render('manage/premises/beds/show', {
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        backLink,
      })
    }
  }
}
