/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/admin'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get } = actions(router, services.auditService)

  const { adminPlacementRequestsController } = controllers

  get(paths.admin.placementRequests.index.pattern, adminPlacementRequestsController.index(), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
  })

  return router
}
