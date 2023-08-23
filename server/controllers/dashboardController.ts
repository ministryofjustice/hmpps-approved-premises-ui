import type { Request, RequestHandler, Response } from 'express'
import { sectionsForUser } from '../utils/users'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const sections = sectionsForUser(res.locals.user)
      const hideNav = true
      res.render('dashboard/index', {
        pageHeading: 'Approved Premises',
        hideNav,
        sections,
      })
    }
  }
}
