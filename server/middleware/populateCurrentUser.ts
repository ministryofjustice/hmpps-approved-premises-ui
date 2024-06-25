import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService, { DeliusAccountMissingStaffDetailsError } from '../services/userService'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = req.session.user || (await userService.getActingUser(res.locals.user.token))
        req.session.user = user
        res.locals.user = { ...user, ...res.locals.user }

        if (!user) {
          logger.info('No user available')
          return res.redirect('/autherror')
        }

        if (!req.session.user.active) {
          logger.error(`User ${req.session.user.name} is inactive`)
          return res.redirect('/autherror')
        }
      }
      return next()
    } catch (error) {
      if (error instanceof DeliusAccountMissingStaffDetailsError) {
        logger.error('Delius account missing staff details')
        return res.redirect('/deliusMissingStaffDetails')
      }
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      return next(error)
    }
  }
}
