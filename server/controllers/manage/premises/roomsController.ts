import type { Request, RequestHandler, Response } from 'express'

import PremisesService from '../../../services/premisesService'

export default class RoomsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const rooms = await this.premisesService.getRooms(req.user.token, req.params.premisesId)

      return res.render('premises/rooms/index', {
        rooms,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage rooms',
      })
    }
  }
}
