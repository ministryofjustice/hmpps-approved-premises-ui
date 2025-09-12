import type { Request, RequestHandler, Response } from 'express'

export default class DashboardController {
  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('pages/index')
    }
  }
}
