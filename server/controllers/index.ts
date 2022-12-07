/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as manageControllers } from './manage'
import { controllers as applyControllers } from './apply'
import { controllers as asssessControllers } from './assess'

import type { Services } from '../services'

export const controllers = (services: Services) => {
  const applicationController = new ApplicationController()

  return {
    applicationController,
    ...manageControllers(services),
    ...applyControllers(services),
    ...asssessControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
