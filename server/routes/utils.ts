/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import { auditMiddleware } from '../middleware/auditMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { MiddlewareSpec } from '../@types/ui'
import applicationAuthMiddleware from '../middleware/applicationAuthMiddleware'
import { validateMiddleware } from '../middleware/validateMiddleware'
import { fieldValidators } from './validators'

export default function actions(router: Router) {
  return {
    get: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.get(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    post: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.post(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    put: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.put(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
    delete: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.delete(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(
            validateMiddleware(auditMiddleware(handler, middlewareSpec), fieldValidators),
            middlewareSpec,
          ),
        ),
      ),
  }
}
