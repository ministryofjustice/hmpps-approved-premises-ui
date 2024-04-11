import { FeatureFlag } from '../services/featureFlagService'

export const retrieveFeatureFlag = (featureFlag: FeatureFlag): boolean => {
  return process.env[featureFlag] === 'true'
}
