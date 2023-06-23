import { NextFunction, Request, RequestHandler, Response } from 'express'
import logger from '../../logger'
import AuditService from '../services/auditService'

export type AuditEventSpec = {
  auditEvent?: string
}

export const auditMiddleware = (
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
) => {
  if (auditEventSpec) {
    return wrapHandler(handler, auditService, auditEventSpec?.auditEvent)
  }
  return handler
}

const wrapHandler =
  (handler: RequestHandler, auditService: AuditService, auditEvent: string | undefined) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const username = res?.locals?.user?.name

    if (!username) {
      logger.error('User without a username is attempting to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, username, req.params)
    }
  }
