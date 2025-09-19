import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import ReferenceDataClient from './referenceDataClient'
import path from '../paths/api'

describe('ReferenceDataClient', () => {
  let referenceDataClient: ReferenceDataClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    referenceDataClient = new ReferenceDataClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getProjectTypes', () => {
    it('should make a GET request to the project types path using user token and return the response body', async () => {
      const projectTypes = {
        projectTypes: [
          {
            id: 1001,
            name: 'Cleaning',
          },
        ],
      }
      nock(config.apis.communityPaybackApi.url)
        .get(path.referenceData.projectTypes.pattern)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, projectTypes)

      const response = await referenceDataClient.getProjectTypes('some-username')

      expect(response).toEqual(projectTypes)
    })
  })
})
