import { Router } from 'express'
import paths from '../paths'
import AppointmentsController from '../controllers/appointmentsController'

export default function appointmentRoutes(appointmentsController: AppointmentsController, router: Router): Router {
  router.get(paths.appointments.update.pattern, async (req, res, next) => {
    const handler = appointmentsController.update()
    await handler(req, res, next)
  })

  return router
}
