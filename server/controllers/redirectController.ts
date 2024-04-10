import { Request, RequestHandler, Response } from 'express'
import { Path } from 'static-path'

export default class RedirectController {
  redirect<T extends string>(path: Path<T>): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.redirect(301, path.pattern)
    }
  }
}
