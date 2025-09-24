/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'
import SessionsController from './sessionsController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const sessionsController = new SessionsController(services.providerService, services.sessionService)

  return {
    dashboardController,
    sessionsController,
  }
}

export type Controllers = ReturnType<typeof controllers>
