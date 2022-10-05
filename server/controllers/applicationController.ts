import type { Response, Request, RequestHandler } from 'express'
import paths from '../paths/approved-premises/manage'

export default class ApplicationController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.redirect(paths.premises.index({}))
    }
  }
}
