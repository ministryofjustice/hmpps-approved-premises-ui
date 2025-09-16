import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import SessionClient from './sessionClient'
import config from '../config'
import { createQueryString } from '../utils/utils'

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

  describe('getSessions', () => {
    it('should make a GET request to the sessions path using user token and return the response body', async () => {
      const startDate = '2026-01-01'
      const endDate = '2026-05-01'
      const teamId = 1

      const queryString = createQueryString({ startDate, endDate, teamId })

      const sessions = {
        allocations: [
          {
            id: 1,
            projectName: 'Community Garden Maintenance',
            teamId,
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
        teamId,
        startDate,
        endDate,
      })

      expect(response).toEqual(sessions)
    })
  })
})
