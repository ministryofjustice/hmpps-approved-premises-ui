import { Request, Response, NextFunction, RequestHandler } from 'express'

import adminPaths from '../../paths/admin'

export default class NewPlacementController {
  constructor() {}

  new(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params

      const backlink = adminPaths.admin.placementRequests.show({ placementRequestId })

      return res.render('match/newPlacement/new', {
        backlink,
        pageHeading: 'New placement',
      })
    }
  }
}
