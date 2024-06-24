import type { Request, RequestHandler, Response } from 'express'

import { PremisesService } from '../../../services'

export default class V2PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.user.token, req.params.premisesId)
      const { apArea } = await this.premisesService.find(req.user.token, req.params.premisesId)
      return res.render('v2Manage/premises/show', {
        premises,
        bookings: premises.bookings,
        apArea,
      })
    }
  }
}
