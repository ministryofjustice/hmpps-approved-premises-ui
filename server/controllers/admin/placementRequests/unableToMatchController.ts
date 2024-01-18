import type { Request, RequestHandler, Response } from 'express'

import { PlacementRequestService } from '../../../services'
import paths from '../../../paths/admin'

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

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      await this.placementRequestService.bookingNotMade(req.user.token, req.params.id, { notes: '' })

      req.flash('success', 'Application has been marked unable to match')

      res.redirect(paths.admin.placementRequests.show({ id: req.params.id }))
    }
  }
}
