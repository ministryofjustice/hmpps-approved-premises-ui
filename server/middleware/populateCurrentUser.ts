import { RequestHandler } from 'express'
import { UserDetails } from '@approved-premises/ui'
import logger from '../../logger'

import UserService, { DeliusAccountMissingStaffDetailsError } from '../services/userService'
import inMemoryStore from '../inMemoryStore'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        let user: UserDetails | undefined = req.session.user || res.locals.user
        if (!inMemoryStore.userVersion || user?.version?.toString() !== inMemoryStore.userVersion) {
          user = await userService.getActingUser(res.locals.user.token)
          logger.info(`****** Updated user via API ****** from ${inMemoryStore.userVersion}  to ${user?.version}`)
        }

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
