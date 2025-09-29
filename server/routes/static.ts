/* istanbul ignore file */

import type { Router } from 'express'
import type { Controllers } from '../controllers'
import type { Services } from '../services'
import actions from './utils'
import staticPaths from '../paths/static'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get } = actions(router, services.auditService)

  const { staticController } = controllers

  get(staticPaths.pages.accessibilityStatement.pattern, staticController.render('accessibility'), {
    auditEvent: 'VIEW_ACCESSIBILITY_STATEMENT',
  })

  get(staticPaths.pages.maintenance.pattern, staticController.render('maintenance'), {
    auditEvent: 'VIEW_MAINTENANCE',
  })

  get(staticPaths.pages.cookiesPolicy.pattern, staticController.render('cookiePolicy'), {
    auditEvent: 'COOKIE_POLICY',
  })

  return router
}
