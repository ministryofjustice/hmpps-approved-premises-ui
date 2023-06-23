/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/tasks'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const { tasksController, allocationsController } = controllers

  get(paths.tasks.index.pattern, tasksController.index())
  get(paths.tasks.show.pattern, tasksController.show())
  post(paths.tasks.allocations.create.pattern, allocationsController.create())

  return router
}
