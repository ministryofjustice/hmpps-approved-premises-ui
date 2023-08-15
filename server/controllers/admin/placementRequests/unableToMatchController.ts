import type { Request, RequestHandler, Response } from 'express'

import { PlacementRequestService } from '../../../services'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class UnableToMatchController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.render('admin/placementRequests/unableToMatch/new', {
        pageHeading: 'Mark as unable to match',
        id: req.params.id,
      })
    }
  }
}
