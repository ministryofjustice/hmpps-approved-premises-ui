/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/assess'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)
  const { assessmentsController } = controllers

  get(paths.assessments.index.pattern, assessmentsController.index())

  return router
}
