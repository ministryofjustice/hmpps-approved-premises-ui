import type { Request, RequestHandler, Response } from 'express'

import PremisesService from '../../../services/premisesService'

export default class BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const beds = await this.premisesService.getBeds(req.user.token, req.params.premisesId)

      return res.render('premises/beds/index', {
        beds,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage beds',
      })
    }
  }
}
