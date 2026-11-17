import { Request, Response, NextFunction } from 'express'
import * as Sentry from '@sentry/node'

export default function setUpSentryProcessor() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    Sentry.getIsolationScope().setTransactionName(`${req.method.toUpperCase()} ${req.route?.path || req.path}`)
    next(err)
  }
}
