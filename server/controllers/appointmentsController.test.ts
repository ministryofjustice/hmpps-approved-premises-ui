import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../services/appointmentService'
import AppointmentsController from './appointmentsController'
import { AppointmentDto, OffenderFullDto } from '../@types/shared'

describe('AppointmentsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let appointmentsController: AppointmentsController
  const appointmentService = createMock<AppointmentService>()

  beforeEach(() => {
    appointmentsController = new AppointmentsController(appointmentService)
  })

  describe('update', () => {
    it('should render the check project details page', async () => {
      const offender: OffenderFullDto = {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      }
      const appointment: AppointmentDto = {
        id: 1001,
        projectName: 'Community Garden Maintenance',
        requirementMinutes: 2400,
        completedMinutes: 480,
        offender,
      }

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = appointmentsController.update()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/projectDetails', {
        appointment,
        offender,
      })
    })
  })
})
