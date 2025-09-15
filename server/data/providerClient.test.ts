import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import ProviderClient from './providerClient'
import config from '../config'

describe('ProviderClient', () => {
  let providerClient: ProviderClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    providerClient = new ProviderClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getTeams', () => {
    it('should make a GET request to the teams path using user token and return the response body', async () => {
      const teams = {
        providers: [
          {
            id: 1001,
            name: 'Team Lincoln',
          },
        ],
      }
      nock(config.apis.communityPaybackApi.url)
        .get('/providers/some-provider-id/teams')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, teams)

      const response = await providerClient.getTeams('some-provider-id', 'some-username')

      expect(response).toEqual(teams)
    })
  })
})
