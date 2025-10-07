import { AppointmentDto } from '../@types/shared'
import AppointmentClient from '../data/appointmentClient'
import AppointmentService from './appointmentService'

jest.mock('../data/appointmentClient')

describe('AppointmentService', () => {
  const appointmentClient = new AppointmentClient(null) as jest.Mocked<AppointmentClient>
  let appointmentService: AppointmentService

  beforeEach(() => {
    appointmentService = new AppointmentService(appointmentClient)
  })

  it('should call getAppointment on the api client and return its result', async () => {
    const appointment: AppointmentDto = {
      id: 1001,
      projectName: 'Community Garden Maintenance',
      projectCode: 'XCT12',
      projectTypeName: 'Environmental Improvement',
      projectTypeCode: 'ENV',
      date: '2025-01-02',
      startTime: '11:00',
      endTime: '12:00',
      supervisingTeam: 'Team Lincoln',
      offender: {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      },
    }

    appointmentClient.find.mockResolvedValue(appointment)

    const result = await appointmentService.getAppointment('1001', 'some-username')

    expect(appointmentClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(appointment)
  })
})
