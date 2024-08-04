import superagent from 'superagent'
import nock from 'nock'
import { userVersionMiddleware } from './userVersionMiddleware'
import InMemoryStore from '../inMemoryStore'

describe('userVersionMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('response headers', () => {
    it('headers handling for x-cas-user-version to store in InMemoryStore for later retrieval', async () => {
      const fakeApi = nock('https://httpbin.org/')
      fakeApi.get('/', '').reply(200, {}, { 'x-cas-user-version': 'test' })

      const res = await superagent.get('https://httpbin.org/').use(userVersionMiddleware).set('accept', 'json')

      expect(res.headers['x-cas-user-version']).toBe(InMemoryStore.userVersion)
      nock.cleanAll()
    })
  })
})
