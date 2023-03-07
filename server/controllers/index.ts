/* istanbul ignore file */

import { controllers as manageControllers } from './manage'
import { controllers as applyControllers } from './apply'
import { controllers as assessControllers } from './assess'

import type { Services } from '../services'
import DashboardController from './dashboardController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    ...manageControllers(services),
    ...applyControllers(services),
    ...assessControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
