import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../services/appointmentService'
import { OffenderFullDto } from '../@types/shared'

export default class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  update(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const offender = appointment.offender as OffenderFullDto
      res.render('appointments/update/projectDetails', { appointment, offender })
    }
  }
}
