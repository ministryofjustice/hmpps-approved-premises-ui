/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/tasks'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const { tasksController, allocationsController } = controllers

  get(paths.tasks.index.pattern, tasksController.index(), {
    auditEvent: 'LIST_TASKS',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_manage_tasks'],
  })
  get(paths.tasks.show.pattern, tasksController.show(), { auditEvent: 'SHOW_TASK' })
  post(paths.tasks.allocations.create.pattern, allocationsController.create(), {
    auditEvent: 'REALLOCATE_TASK_SUCCESS',
    redirectAuditEventSpecs: [{ path: paths.tasks.show.pattern, auditEvent: 'REALLOCATE_TASK_FAILURE' }],
  })

  return router
}
