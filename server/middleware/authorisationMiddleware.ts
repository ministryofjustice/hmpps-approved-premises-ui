import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import { UUID } from 'crypto'
import logger from '../../logger'
import asyncMiddleware from './asyncMiddleware'

export default function authorisationMiddleware(authorisedRoles: Array<string> = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [], user_uuid: userUuid } = jwtDecode(res.locals.user.token) as {
        authorities?: Array<string>
        user_uuid?: UUID
      }
      res.locals.user = {
        ...res.locals.user,
        userUuid,
      }
      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error(`User ${res.locals.user?.id} does not have any of the the required roles ${roles.join(', ')}`)
        return res.redirect('/autherror')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
