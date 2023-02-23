import type { Request, RequestHandler, Response } from 'express'
import paths from '../paths/manage'

export default class ApplicationController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.redirect(paths.premises.index({}))
    }
  }
}
