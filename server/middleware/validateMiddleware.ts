import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Validators } from 'server/routes/validators'
import logger from '../../logger'

export const validateMiddleware =
  (handler: RequestHandler, validators: Validators) => async (req: Request, res: Response, next: NextFunction) => {
    const errors = Object.entries(req.params).filter(([key, value]) => {
      const regExp = validators[key as keyof Validators]
      return !regExp || !regExp.test(value)
    })
    if (errors.length) {
      logger.error(
        `Path parameter validation error ${errors
          .map(([key, value]) => {
            return `${key}="${value}"`
          })
          .join(', ')}`,
      )
      return next()
    }
    return handler(req, res, next)
  }
