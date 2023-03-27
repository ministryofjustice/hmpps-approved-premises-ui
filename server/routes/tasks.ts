/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import paths from '../paths/tasks'

export default function routes(controllers: Controllers, router: Router): Router {
  const { tasksController, allocationsController } = controllers

  router.get(paths.tasks.index.pattern, tasksController.index())
  router.get(paths.tasks.show.pattern, tasksController.show())
  router.post(paths.tasks.allocations.create.pattern, allocationsController.create())

  return router
}
