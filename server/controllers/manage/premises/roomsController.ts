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

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const room = await this.premisesService.getRoom(req.user.token, req.params.premisesId, req.params.roomId)

      return res.render('premises/rooms/show', {
        room,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage room',
      })
    }
  }
}
