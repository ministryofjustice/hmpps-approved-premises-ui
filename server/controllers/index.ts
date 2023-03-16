/* istanbul ignore file */

import { controllers as manageControllers } from './manage'
import { controllers as applyControllers } from './apply'
import { controllers as assessControllers } from './assess'
import TasksController from './tasksController'

import type { Services } from '../services'
import DashboardController from './dashboardController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const tasksController = new TasksController(services.taskService, services.applicationService, services.userService)
  return {
    dashboardController,
    tasksController,
    ...manageControllers(services),
    ...applyControllers(services),
    ...assessControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
