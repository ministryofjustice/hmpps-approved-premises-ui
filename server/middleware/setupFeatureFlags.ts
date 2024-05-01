import { RequestHandler, Router } from 'express'
import { throttle } from 'underscore'
import { Services } from '../services'
import FeatureFlagService, { FeatureFlag } from '../services/featureFlagService'
import logger from '../../logger'

export const featureFlagsToUse: Array<FeatureFlag> = [
  'allow-sufficient-information-request-without-confirmation',
  'show-search-by-CRN-timeline-navigation',
]
export const throttleTime = 15 * 1000

export const setupFeatureFlags = ({ featureFlagService }: Services): Router => {
  const router = Router()

  router.use(featureFlagHandler(featureFlagService))
  return router
}

export const featureFlagHandler = (featureFlagService: FeatureFlagService): RequestHandler => {
  const retrieveFlagThrottled = throttle(retrieveFlags, throttleTime)
  return async (_, __, next) => {
    try {
      retrieveFlagThrottled(featureFlagService)

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export const retrieveFlags = (featureFlagService: FeatureFlagService) => {
  return Promise.all(
    featureFlagsToUse.map(async flag => {
      const flagBool = await retrieveFlag(flag, featureFlagService)
      process.env[flag] = flagBool.toString()
    }),
  )
}

export const retrieveFlag = async (flag: FeatureFlag, featureFlagService: FeatureFlagService) => {
  let flagValue = false
  try {
    flagValue = await featureFlagService.getBooleanFlag(flag)
  } catch (error) {
    logger.error(`Error retrieving feature flag ${flag}`, error)
  }

  return flagValue
}
