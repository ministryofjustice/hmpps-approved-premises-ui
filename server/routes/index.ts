import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import paths from '../paths'

export default function routes(controllers: Controllers, { auditService }: Services): Router {
  const router = Router()

  const { dashboardController, sessionsController } = controllers

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    const handler = dashboardController.index()
    await handler(req, res, next)
  })

  router.get('/sessions', async (req, res, next) => {
    const handler = sessionsController.index()
    await handler(req, res, next)
  })

  router.get('/sessions/search', async (req, res, next) => {
    const handler = sessionsController.search()
    await handler(req, res, next)
  })

  router.get(paths.sessions.show.pattern, async (req, res, next) => {
    const handler = sessionsController.show()
    await handler(req, res, next)
  })

  return router
}
