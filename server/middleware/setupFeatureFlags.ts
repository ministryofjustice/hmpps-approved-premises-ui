import { RequestHandler, Router } from 'express'
import { throttle } from 'underscore'
import { Services } from '../services'
import FeatureFlagService, { FeatureFlag } from '../services/featureFlagService'

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
  featureFlagsToUse.forEach(async flag => {
    const flagBool = await featureFlagService.getBooleanFlag(flag)

    process.env[flag] = flagBool.toString()
  })
}
