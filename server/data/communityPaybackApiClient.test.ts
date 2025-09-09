import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CommunityPaybackApiClient from './communityPaybackApiClient'
import config from '../config'

describe('CommunityPaybackApiClient', () => {
  let communityPaybackApiClient: CommunityPaybackApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    communityPaybackApiClient = new CommunityPaybackApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getExampleData', () => {
    it('should make a GET request to /example using user token and return the response body', async () => {
      nock(config.apis.communityPaybackApi.url)
        .get('/example')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { data: 'some data' })

      const response = await communityPaybackApiClient.getExampleData('some-username')

      expect(response).toEqual({ data: 'some data' })
    })
  })
})
