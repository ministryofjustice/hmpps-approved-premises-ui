import { Request, RequestHandler, Response } from 'express'
import { Params, Path } from 'static-path'

export default class RedirectController {
  redirect<T extends string>(path: Path<T>): RequestHandler {
    return async (req: Request, res: Response) => {
      res.redirect(301, path(req.params as Params<T>))
    }
  }
}
