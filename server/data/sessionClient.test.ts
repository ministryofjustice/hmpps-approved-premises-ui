import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import SessionClient from './sessionClient'
import config from '../config'
import { createQueryString } from '../utils/utils'
import { SessionDto } from '../@types/shared'

describe('SessionClient', () => {
  let sessionClient: SessionClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    sessionClient = new SessionClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should make a GET request to the find sessions path using user token and return the response body', async () => {
      const projectId = '1'
      const date = '2026-01-01'
      const queryString = createQueryString({ date })

      const session: SessionDto = {
        projectName: 'Park cleaning',
        projectCode: 'XCT12',
        projectLocation: 'Hammersmith',
        date: '2025-01-02',
        startTime: '11:00',
        endTime: '12:00',
        appointmentSummaries: [
          {
            id: 1001,
            requirementMinutes: 600,
            completedMinutes: 500,
            offender: {
              forename: 'John',
              surname: 'Smith',
              crn: 'CRN123',
              objectType: 'OffenderFull',
            },
          },
        ],
      }

      nock(config.apis.communityPaybackApi.url)
        .get(`/projects/${projectId}/appointments?${queryString}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, session)

      const response = await sessionClient.find('some-username', projectId, date)

      expect(response).toEqual(session)
    })
  })

  describe('getSessions', () => {
    it('should make a GET request to the sessions path using user token and return the response body', async () => {
      const startDate = '2026-01-01'
      const endDate = '2026-05-01'
      const teamCode = 'XRTC123'

      const queryString = createQueryString({ startDate, endDate, teamCode })

      const sessions = {
        allocations: [
          {
            id: 1,
            projectName: 'Community Garden Maintenance',
            teamId: 4,
            startDate,
            endDate,
            projectCode: '123',
            allocated: 12,
            outcomes: 2,
            enforcements: 3,
          },
        ],
      }

      nock(config.apis.communityPaybackApi.url)
        .get(`/projects/allocations?${queryString}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, sessions)

      const response = await sessionClient.getSessions({
        username: 'some-username',
        teamCode,
        startDate,
        endDate,
      })

      expect(response).toEqual(sessions)
    })
  })
})
