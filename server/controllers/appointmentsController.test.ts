import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../services/appointmentService'
import AppointmentsController from './appointmentsController'
import { AppointmentDto, OffenderFullDto } from '../@types/shared'
import Offender from '../models/offender'

jest.mock('../models/offender')

describe('AppointmentsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
  const offender = {
    name: 'Sam Smith',
    crn: 'CRN123',
    isLimited: false,
  }

  let appointmentsController: AppointmentsController
  const appointmentService = createMock<AppointmentService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(appointmentService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('update', () => {
    it('should render the check project details page', async () => {
      const offenderResponse: OffenderFullDto = {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      }
      const appointment: AppointmentDto = {
        id: 1001,
        projectName: 'Community Garden Maintenance',
        projectTypeName: 'Environmental Improvement',
        projectTypeCode: 'ENV',
        offender: offenderResponse,
        supervisingTeam: 'Team Lincoln',
        projectCode: 'XCT12',
        date: '2025-01-02',
        startTime: '11:00',
        endTime: '12:00',
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
