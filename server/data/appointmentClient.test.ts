import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import AppointmentClient from './appointmentClient'
import { AppointmentDto } from '../@types/shared'
import paths from '../paths/api'

describe('find', () => {
  let appointmentClient: AppointmentClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    appointmentClient = new AppointmentClient(mockAuthenticationClient)
  })

  it('should make a GET request to the appointments path using user token and return the response body', async () => {
    const appointment: AppointmentDto = {
      id: 1001,
      projectName: 'Community Garden Maintenance',
      requirementMinutes: 2400,
      completedMinutes: 480,
      offender: {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      },
    }

    nock(config.apis.communityPaybackApi.url)
      .get(paths.appointments.singleAppointment({ appointmentId: '1001' }))
      .matchHeader('authorization', 'Bearer test-system-token')
      .reply(200, appointment)

    const response = await appointmentClient.find('some-provider-id', '1001')

    expect(response).toEqual(appointment)
  })
})
