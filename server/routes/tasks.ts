/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'

export default function routes(controllers: Controllers, router: Router): Router {
  const { tasksController } = controllers

  router.get('/tasks', tasksController.index())

  return router
}
