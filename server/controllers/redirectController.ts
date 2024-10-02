import { Request, RequestHandler, Response } from 'express'
import { Params, Path } from 'static-path'
import logger from '../../logger'

export default class RedirectController {
  redirect<T extends string>(path: Path<T>, overrideParams: Partial<Params<T>> = {}): RequestHandler {
    return async (req: Request, res: Response) => {
      const to = path({ ...req.params, ...overrideParams } as Params<T>)
      logger.info(`Redirecting from ${req.path} to ${to}`)
      res.redirect(301, to)
    }
  }
}
