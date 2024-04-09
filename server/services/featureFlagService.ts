import { ClientTokenAuthentication, FliptClient } from '@flipt-io/flipt'
import config from '../config'
import logger from '../../logger'

const featureFlags = ['show-both-arrival-dates'] as const

export type FeatureFlag = (typeof featureFlags)[number]
export type FeatureFlags = Record<FeatureFlag, boolean>

export default class FeatureFlagService {
  fliptClient: FliptClient | null

  namespaceKey: string | null

  constructor() {
    if (config.fliptEnabled) {
      this.fliptClient = new FliptClient({
        url: config.apis.flipt.url,
        authenticationStrategy: new ClientTokenAuthentication(config.apis.flipt.token),
      })
      this.namespaceKey = config.apis.flipt.namespace
    }
  }

  async getBooleanFlag(flag: FeatureFlag): Promise<boolean> {
    if (!config.fliptEnabled) {
      return true
    }

    try {
      const response = await this.fliptClient.evaluation.boolean({
        namespaceKey: this.namespaceKey,
        flagKey: flag,
        entityId: '',
        context: {},
      })

      return response.enabled
    } catch (err) {
      if (err.message?.includes('not found')) {
        logger.error(`Feature flag ${flag} not found, defaulting to false`)
        return false
      }
      throw err
    }
  }

  async getAll(): Promise<FeatureFlags> {
    const flags = await Promise.all(
      featureFlags.map(async flag => {
        const enabled = await this.getBooleanFlag(flag)
        return [flag, enabled] as const
      }),
    )

    return flags.reduce((prev, [flag, enabled]) => ({ ...prev, [flag]: enabled }), {} as FeatureFlags)
  }
}
