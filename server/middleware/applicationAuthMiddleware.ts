import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { MiddlewareSpec } from '../@types/ui'
import { ApprovedPremisesUserRole } from '../@types/shared'
import logger from '../../logger'

export default function applicationAuthMiddleware(requestHandler: RequestHandler, middlewareSpec?: MiddlewareSpec) {
  if (middlewareSpec?.allowedRoles) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (res.locals.user.roles.some((role: ApprovedPremisesUserRole) => middlewareSpec.allowedRoles.includes(role))) {
        return requestHandler(req, res, next)
      }

      logger.error('User is not authorised to access this')
      res.status(401)
      return res.render('roleError')
    }
  }

  return requestHandler
}
