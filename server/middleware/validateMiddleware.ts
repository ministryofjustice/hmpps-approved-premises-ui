import { NextFunction, Request, RequestHandler, Response } from 'express'
import { MiddlewareSpec } from '@approved-premises/ui'
import logger from '../../logger'

export const validateMiddleware = (handler: RequestHandler, eventSpec?: MiddlewareSpec) => {
  if (eventSpec?.parameterValidators) {
    return wrapHandler(handler, eventSpec.parameterValidators)
  }
  return handler
}

const wrapHandler =
  (handler: RequestHandler, parameterValidators: Record<string, RegExp>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = Object.entries(parameterValidators).filter(([key, regExp]) => !regExp.test(req.params[key]))
    if (errors.length) {
      logger.error(
        `Path parameter validation error ${errors
          .map(([key]) => {
            return `${key}="${req.params[key]}"`
          })
          .join(', ')}`,
      )
      return next()
    }
    return handler(req, res, next)
  }
