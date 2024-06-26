import nock from 'nock'

import { createMock } from '@golevelup/ts-jest'
import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import TokenStore from './tokenStore'
import { RedisClient } from './redisClient'

jest.mock('./tokenStore')
jest.mock('./redisClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient(tokenStore)
    tokenStore.getToken.mockResolvedValue(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getSystemClientToken', () => {
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthClient.getSystemClientToken(username)
    })

    it('should return token from redis if one exists', async () => {
      const output = await hmppsAuthClient.getSystemClientToken(username)
      expect(output).toEqual(token.access_token)
    })

    it("should fetch a new token from HMPPS Auth with username when one doesn't exist in redis", async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials&username=Bob')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('Bob', token.access_token, 240)
    })

    it("should fetch a new token from HMPPS Auth without username when one doesn't exist in redis", async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
    })
  })
})
