/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController(services.exampleService)

  return {
    dashboardController,
  }
}

export type Controllers = ReturnType<typeof controllers>
