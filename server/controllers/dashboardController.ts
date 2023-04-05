import type { Request, RequestHandler, Response } from 'express'
import { sectionsForUser } from '../utils/userUtils'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const sections = sectionsForUser(res.locals.user)
      res.render('dashboard/index', {
        pageHeading: 'Approved Premises',
        sections,
      })
    }
  }
}
