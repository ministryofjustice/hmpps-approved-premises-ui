/* istanbul ignore file */

import { controllers as applyControllers } from './apply'
import { controllers as assessControllers } from './assess'
import { controllers as matchControllers } from './match'
import { controllers as manageControllers } from './manage'
import TasksController from './tasksController'
import AllocationsController from './tasks/allocationsController'

import type { Services } from '../services'
import DashboardController from './dashboardController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const tasksController = new TasksController(services.taskService, services.applicationService)
  const allocationsController = new AllocationsController(services.taskService)
  return {
    dashboardController,
    tasksController,
    allocationsController,
    ...applyControllers(services),
    ...assessControllers(services),
    ...matchControllers(services),
    ...manageControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
