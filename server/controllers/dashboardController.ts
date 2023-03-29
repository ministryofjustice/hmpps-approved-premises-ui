import type { Request, RequestHandler, Response } from 'express'
import assessPaths from '../paths/assess'
import applyPaths from '../paths/apply'
import managePaths from '../paths/manage'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        pageHeading: 'Approved Premises',
        applyPath: applyPaths.applications.index({}),
        assessPath: assessPaths.assessments.index({}),
        managePath: managePaths.premises.index({}),
      })
    }
  }
}
