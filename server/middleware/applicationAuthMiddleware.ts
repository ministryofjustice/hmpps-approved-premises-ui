import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { MiddlewareSpec } from '../@types/ui'
import logger from '../../logger'
import { hasPermission, hasRole } from '../utils/users'

export default function applicationAuthMiddleware(requestHandler: RequestHandler, middlewareSpec?: MiddlewareSpec) {
  if (middlewareSpec?.allowedRoles || middlewareSpec?.allowedPermissions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (
        (middlewareSpec?.allowedRoles || []).some(role => hasRole(res.locals.user, role)) ||
        (middlewareSpec?.allowedPermissions && hasPermission(res.locals.user, middlewareSpec.allowedPermissions))
      ) {
        return requestHandler(req, res, next)
      }

      logger.error('User is not authorised to access this')
      res.status(401)
      return res.render('roleError')
    }
  }

  return requestHandler
}
