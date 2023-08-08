/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import AuditService from '../services/auditService'
import { auditMiddleware } from '../middleware/auditMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { MiddlewareSpec } from '../@types/ui'
import applicationAuthMiddleware from '../middleware/applicationAuthMiddleware'

export default function actions(router: Router, auditService: AuditService) {
  return {
    get: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.get(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(auditMiddleware(handler, auditService, middlewareSpec), middlewareSpec),
        ),
      ),
    post: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.post(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(auditMiddleware(handler, auditService, middlewareSpec), middlewareSpec),
        ),
      ),
    put: (path: string | Array<string>, handler: RequestHandler, middlewareSpec?: MiddlewareSpec) =>
      router.put(
        path,
        asyncMiddleware(
          applicationAuthMiddleware(auditMiddleware(handler, auditService, middlewareSpec), middlewareSpec),
        ),
      ),
  }
}
