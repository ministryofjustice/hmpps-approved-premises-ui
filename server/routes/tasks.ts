/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import paths from '../paths/tasks'

export default function routes(controllers: Controllers, router: Router): Router {
  const { tasksController } = controllers

  router.get(paths.index.pattern, tasksController.index())
  router.get(paths.allocations.show.pattern, tasksController.show())
  router.post(paths.allocations.show.pattern, tasksController.create())

  return router
}
